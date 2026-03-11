<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../utils/functions.php';

class AuthController {
    private $db;
    private $collection = "users";

    public function __construct() {
        $this->db = connectDB();
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            jsonResponse(["message" => "Email and password are required"], 400);
        }

        $filter = ['email' => $email];
        $query = new MongoDB\Driver\Query($filter);
        $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
        $user = current($cursor->toArray());

        if ($user && password_verify($password, $user->password)) {
            $token = SimpleJWT::encode(['id' => (string)$user->_id]);
            jsonResponse([
                "_id" => (string)$user->_id,
                "name" => $user->name,
                "email" => $user->email,
                "role" => $user->role,
                "token" => $token
            ]);
        } else {
            jsonResponse(["message" => "Invalid email or password"], 401);
        }
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'user';

        if (!$name || !$email || !$password) {
            jsonResponse(["message" => "Name, email and password are required"], 400);
        }

        // Check if exists
        $filter = ['email' => $email];
        $query = new MongoDB\Driver\Query($filter);
        $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
        if (current($cursor->toArray())) {
            jsonResponse(["message" => "User already exists"], 400);
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $bulk = new MongoDB\Driver\BulkWrite;
        $doc = [
            'name' => $name,
            'email' => $email,
            'password' => $hashedPassword,
            'role' => $role,
            'createdAt' => new MongoDB\BSON\UTCDateTime(),
            'updatedAt' => new MongoDB\BSON\UTCDateTime()
        ];
        $_id = $bulk->insert($doc);
        $this->db->executeBulkWrite(getCollection($this->collection), $bulk);

        $token = SimpleJWT::encode(['id' => (string)$_id]);
        jsonResponse([
            "_id" => (string)$_id,
            "name" => $name,
            "email" => $email,
            "role" => $role,
            "token" => $token
        ], 201);
    }

    public function getUsers() {
        // Simple auth check could be a middleware function
        $token = getBearerToken();
        $payload = SimpleJWT::decode($token);
        if (!$payload) jsonResponse(["message" => "Not authorized"], 401);

        $query = new MongoDB\Driver\Query([]);
        $cursor = $this->db->executeQuery(getCollection($this->collection), $query);
        $users = $cursor->toArray();

        // Remove passwords
        foreach ($users as &$u) {
            unset($u->password);
        }

        jsonResponse($users);
    }
}
?>
