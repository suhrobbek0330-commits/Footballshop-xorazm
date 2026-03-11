<?php
require_once __DIR__ . '/../utils/functions.php';

// MongoDB connection using the native driver
function connectDB() {
    $mongo_uri = "mongodb+srv://suhrobbek0330:suhro0330@cluster0.rf6btxt.mongodb.net/footballshop?retryWrites=true&w=majority&appName=Cluster0";
    
    try {
        // Requires 'mongodb' extension to be enabled in php.ini
        if (!class_exists('MongoDB\Driver\Manager')) {
            jsonResponse(["message" => "PHP MongoDB extension is not installed/enabled"], 500);
        }
        $manager = new MongoDB\Driver\Manager($mongo_uri);
        return $manager;
    } catch (Exception $e) {
        jsonResponse(["message" => "Database connection failed: " . $e->getMessage()], 500);
    }
}

// Helper to get a collection name with database
function getCollection($name) {
    return "footballshop.$name";
}
?>
