<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/functions.php';

class DemandController {
    private $db;
    private $collection = "demands";

    public function __construct() {
        $this->db = connectDB();
    }

    public function create() {
        $this->checkAuth();
        $data = json_decode(file_get_contents("php://input"), true);
        $data['fulfilled'] = false;
        $data['createdAt'] = new MongoDB\BSON\UTCDateTime();
        $data['updatedAt'] = new MongoDB\BSON\UTCDateTime();

        $bulk = new MongoDB\Driver\BulkWrite;
        $id = $bulk->insert($data);
        $this->db->executeBulkWrite(getCollection($this->collection), $bulk);

        jsonResponse(["_id" => (string)$id, "message" => "Demand created"], 201);
    }

    public function getAll() {
        $this->checkAuth();
        $filter = ['fulfilled' => false];
        $query = new MongoDB\Driver\Query($filter);
        $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
        jsonResponse($cursor->toArray());
    }

    public function fulfill($id) {
        $this->checkAuth();
        try {
            $objectId = new MongoDB\BSON\ObjectId($id);
            $bulk = new MongoDB\Driver\BulkWrite;
            $bulk->update(['_id' => $objectId], ['$set' => ['fulfilled' => true, 'updatedAt' => new MongoDB\BSON\UTCDateTime()]]);
            $this->db->executeBulkWrite(getCollection($this->collection), $bulk);
            jsonResponse(["message" => "Demand fulfilled"]);
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
