<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/functions.php';

class ProductController {
    private $db;
    private $collection = "products";

    public function __construct() {
        $this->db = connectDB();
    }

    public function getAll() {
        $keyword = $_GET['keyword'] ?? '';
        $filter = [];
        if ($keyword) {
            $filter = ['name' => ['$regex' => $keyword, '$options' => 'i']];
        }

        $query = new MongoDB\Driver\Query($filter);
        $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
        jsonResponse($cursor->toArray());
    }

    public function getById($id) {
        try {
            $objectId = new MongoDB\BSON\ObjectId($id);
            $filter = ['_id' => $objectId];
            $query = new MongoDB\Driver\Query($filter);
            $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
            $product = current($cursor->toArray());
            if ($product) jsonResponse($product);
            else jsonResponse(["message" => "Product not found"], 404);
        } catch (Exception $e) {
            jsonResponse(["message" => "Invalid ID format"], 400);
        }
    }

    public function create() {
        $this->checkAuth();
        
        $name = $_POST['name'] ?? '';
        $price = $_POST['sellingPrice'] ?? 0;
        $category = $_POST['category'] ?? '';
        $variants = isset($_POST['variants']) ? json_decode($_POST['variants'], true) : [];
        
        $productData = [
            'name' => $name,
            'category' => $category,
            'originalPrice' => (float)($_POST['originalPrice'] ?? 0),
            'sellingPrice' => (float)$price,
            'lowStockThreshold' => (int)($_POST['lowStockThreshold'] ?? 5),
            'variants' => $variants,
            'soldHistory' => [],
            'createdAt' => new MongoDB\BSON\UTCDateTime(),
            'updatedAt' => new MongoDB\BSON\UTCDateTime()
        ];

        // Image Handling
        if (isset($_FILES['image'])) {
            $uploadDir = __DIR__ . '/../uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $fileName = time() . '_' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $productData['image'] = '/uploads/' . $fileName;
            }
        }

        // Calculate total quantity from variants
        $totalQuantity = 0;
        foreach ($variants as $v) {
            $totalQuantity += (int)($v['quantity'] ?? 0);
        }
        $productData['quantity'] = $totalQuantity ?: (int)($_POST['quantity'] ?? 0);

        $bulk = new MongoDB\Driver\BulkWrite;
        $_id = $bulk->insert($productData);
        $this->db->executeBulkWrite(getCollection($this->collection), $bulk);

        $productData['_id'] = (string)$_id;
        jsonResponse($productData, 201);
    }

    public function update($id) {
        $this->checkAuth();
        try {
            $objectId = new MongoDB\BSON\ObjectId($id);
            $data = $_POST; // For multipart
            if (empty($data)) $data = json_decode(file_get_contents("php://input"), true);
            
            $updateData = [];
            foreach (['name', 'category', 'originalPrice', 'sellingPrice', 'lowStockThreshold'] as $field) {
                if (isset($data[$field])) $updateData[$field] = $data[$field];
            }
            if (isset($data['variants'])) {
                $variants = is_string($data['variants']) ? json_decode($data['variants'], true) : $data['variants'];
                $updateData['variants'] = $variants;
                $totalQuantity = 0;
                foreach ($variants as $v) $totalQuantity += (int)($v['quantity'] ?? 0);
                $updateData['quantity'] = $totalQuantity;
            }
            
            if (isset($_FILES['image'])) {
                $uploadDir = __DIR__ . '/../uploads/';
                $fileName = time() . '_' . basename($_FILES['image']['name']);
                if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $fileName)) {
                    $updateData['image'] = '/uploads/' . $fileName;
                }
            }

            $updateData['updatedAt'] = new MongoDB\BSON\UTCDateTime();

            $bulk = new MongoDB\Driver\BulkWrite;
            $bulk->update(['_id' => $objectId], ['$set' => $updateData]);
            $this->db->executeBulkWrite(getCollection($this->collection), $bulk);

            jsonResponse(["message" => "Product updated"]);
        } catch (Exception $e) {
            jsonResponse(["message" => $e->getMessage()], 400);
        }
    }

    public function delete($id) {
        $this->checkAuth();
        try {
            $objectId = new MongoDB\BSON\ObjectId($id);
            $bulk = new MongoDB\Driver\BulkWrite;
            $bulk->delete(['_id' => $objectId]);
            $this->db->executeBulkWrite(getCollection($this->collection), $bulk);
            jsonResponse(["message" => "Product removed"]);
        } catch (Exception $e) {
            jsonResponse(["message" => "Invalid ID"], 400);
        }
    }

    private function checkAuth() {
        $token = getBearerToken();
        $payload = SimpleJWT::decode($token);
        if (!$payload) jsonResponse(["message" => "Not authorized"], 401);
        return $payload;
    }
}
?>
