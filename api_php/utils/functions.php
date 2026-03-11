<?php
// Response helpers
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

// Simple JWT implementation for HS256
// In production, using a library like firebase/php-jwt is recommended
class SimpleJWT {
    private static $secret = "secretkey123"; // Should match Node.js secret

    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        list($header, $payload, $signature) = $parts;
        $decodedSignature = base64_decode(str_replace(['-', '_'], ['+', '/'], $signature));
        $expectedSignature = hash_hmac('sha256', $header . "." . $payload, self::$secret, true);
        if (!hash_equals($decodedSignature, $expectedSignature)) return null;
        return json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    }
}
?>
