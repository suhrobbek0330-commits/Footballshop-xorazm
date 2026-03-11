<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/utils/functions.php';
require_once __DIR__ . '/config/db.php';

$request_uri = $_SERVER['REQUEST_URI'];
// Simple router logic
// Assuming calls look like /api_php/index.php/auth/login or via .htaccess /api/auth/login
$path = parse_url($request_uri, PHP_URL_PATH);
// Strip leading /api_php/index.php or /api if rewrite is used
$path_parts = explode('/', trim($path, '/'));

// Detect where the 'api' or 'index.php' is
$api_index = array_search('api', $path_parts);
if ($api_index === false) $api_index = array_search('index.php', $path_parts);

if ($api_index === false) {
    // If not found, assume it is at the root or handle accordingly
    $resource = $path_parts[0] ?? '';
    $action = $path_parts[1] ?? '';
    $id = $path_parts[2] ?? '';
} else {
    $resource = $path_parts[$api_index + 1] ?? '';
    $action = $path_parts[$api_index + 2] ?? '';
    $id = $path_parts[$api_index + 3] ?? '';
}

$method = $_SERVER['REQUEST_METHOD'];

// Routing
switch ($resource) {
    case 'auth':
        require_once __DIR__ . '/controllers/AuthController.php';
        $controller = new AuthController();
        if ($action === 'login') $controller->login();
        if ($action === 'register') $controller->register();
        if ($action === 'users') $controller->getUsers();
        break;

    case 'products':
        require_once __DIR__ . '/controllers/ProductController.php';
        $controller = new ProductController();
        if ($method === 'GET') {
            if ($action) $controller->getById($action);
            else $controller->getAll();
        }
        if ($method === 'POST') $controller->create();
        if ($method === 'PUT') $controller->update($action);
        if ($method === 'DELETE') $controller->delete($action);
        break;

    case 'sales':
        require_once __DIR__ . '/controllers/SaleController.php';
        $controller = new SaleController();
        if ($action === 'stats') $controller->getStats();
        if ($method === 'POST') $controller->create();
        break;

    case 'debts':
        require_once __DIR__ . '/controllers/DebtController.php';
        $controller = new DebtController();
        if ($method === 'GET') $controller->getAll();
        if ($method === 'POST') $controller->create();
        if ($method === 'PUT' && $id === 'pay') $controller->updateStatus($action);
        break;

    case 'demands':
        require_once __DIR__ . '/controllers/DemandController.php';
        $controller = new DemandController();
        if ($method === 'GET') $controller->getAll();
        if ($method === 'POST') $controller->create();
        if ($method === 'PUT' && $id === 'fulfill') $controller->fulfill($action);
        break;

    default:
        jsonResponse(["message" => "Endpoint not found: $resource"], 404);
        break;
}
?>
