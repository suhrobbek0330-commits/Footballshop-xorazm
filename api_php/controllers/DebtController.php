<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/functions.php';

class DebtController {
    private $db;
    private $collection = "debts";
    private $productCollection = "products";
    private $saleCollection = "sales";

    public function __construct() {
        $this->db = connectDB();
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"), true);
        $products = $data['products'] ?? [];
        $userId = $this->checkAuth()['id'];

        try {
            $session = $this->db->startSession();
            $session->startTransaction();

            foreach ($products as $item) {
                if (isset($item['product'])) {
                    $productId = new MongoDB\BSON\ObjectId($item['product']);
                    $filter = ['_id' => $productId];
                    $query = new MongoDB\Driver\Query($filter);
                    $cursor = $this->db->executeQuery(getCollection($this->productCollection), $query);
                    $product = current($cursor->toArray());

                    if ($product) {
                        if ($product->quantity < $item['quantity']) throw new Exception("Mahsulot yetarli emas: " . $product->name);

                        // Update Stock
                        $newQuantity = $product->quantity - $item['quantity'];
                        $newVariants = $product->variants;

                        if (!empty($newVariants)) {
                            $remainingToSubtract = $item['quantity'];
                            foreach ($newVariants as &$variant) {
                                if ($remainingToSubtract <= 0) break;
                                $canSubtract = min($variant->quantity, $remainingToSubtract);
                                $variant->quantity -= $canSubtract;
                                $remainingToSubtract -= $canSubtract;
                            }
                            if ($remainingToSubtract > 0) {
                                $newVariants[count($newVariants) - 1]->quantity -= $remainingToSubtract;
                            }
                        }

                        $newSoldHistory = $product->soldHistory;
                        $newSoldHistory[] = [
                            'soldPrice' => (float)$item['price'],
                            'quantity' => (int)$item['quantity'],
                            'date' => new MongoDB\BSON\UTCDateTime()
                        ];

                        $bulk = new MongoDB\Driver\BulkWrite;
                        $bulk->update(['_id' => $productId], ['$set' => [
                            'quantity' => $newQuantity,
                            'variants' => $newVariants,
                            'soldHistory' => $newSoldHistory,
                            'updatedAt' => new MongoDB\BSON\UTCDateTime()
                        ]]);
                        $this->db->executeBulkWrite(getCollection($this->productCollection), $bulk, ['session' => $session]);
                    }
                }
            }

            $bulkDebt = new MongoDB\Driver\BulkWrite;
            $data['createdAt'] = new MongoDB\BSON\UTCDateTime();
            $data['updatedAt'] = new MongoDB\BSON\UTCDateTime();
            $debtId = $bulkDebt->insert($data);
            $this->db->executeBulkWrite(getCollection($this->collection), $bulkDebt, ['session' => $session]);

            $session->commitTransaction();
            jsonResponse(['_id' => (string)$debtId, 'message' => 'Debt created'], 201);
        } catch (Exception $e) {
            if (isset($session)) $session->abortTransaction();
            jsonResponse(['message' => $e->getMessage()], 400);
        }
    }

    public function getAll() {
        $this->checkAuth();
        $keywordStr = $_GET['keyword'] ?? '';
        $filter = [];
        if ($keywordStr) {
            $filter = ['customerName' => ['$regex' => $keywordStr, '$options' => 'i']];
        }
        $query = new MongoDB\Driver\Query($filter, ['sort' => ['deadline' => 1]]);
        $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
        jsonResponse($cursor->toArray());
    }

    public function updateStatus($id) {
        $this->checkAuth();
        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? '';
        
        $objectId = new MongoDB\BSON\ObjectId($id);
        $query = new MongoDB\Driver\Query(['_id' => $objectId]);
        $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
        $debt = current($cursor->toArray());

        if ($debt) {
            if ($debt->status !== 'paid' && $status === 'paid') {
                // Convert to Sale
                $bulkSale = new MongoDB\Driver\BulkWrite;
                $items = [];
                foreach ($debt->products as $p) {
                    $items[] = [
                        'product' => $p->product,
                        'productName' => $p->productName,
                        'quantity' => $p->quantity,
                        'price' => $p->price,
                        'subtotal' => $p->quantity * $p->price
                    ];
                }
                $saleDoc = [
                    'items' => $items,
                    'totalAmount' => $debt->totalAmount,
                    'paymentMethod' => 'cash',
                    'createdAt' => new MongoDB\BSON\UTCDateTime(),
                    'updatedAt' => new MongoDB\BSON\UTCDateTime()
                ];
                $bulkSale->insert($saleDoc);
                $this->db->executeBulkWrite(getCollection($this->saleCollection), $bulkSale);
            }

            $bulk = new MongoDB\Driver\BulkWrite;
            $bulk->update(['_id' => $objectId], ['$set' => ['status' => $status, 'updatedAt' => new MongoDB\BSON\UTCDateTime()]]);
            $this->db->executeBulkWrite(getCollection($this->collection), $bulk);
            jsonResponse(["message" => "Debt status updated"]);
        } else {
            jsonResponse(["message" => "Debt not found"], 404);
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
