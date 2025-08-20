<?php
/**
 * Product Detail API Endpoint
 * API để lấy chi tiết sản phẩm theo ID
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    // Get product ID from URL parameter
    $productId = $_GET['id'] ?? null;
    
    if (!$productId || !is_numeric($productId)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Product ID is required and must be numeric',
            'code' => 'INVALID_PRODUCT_ID'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $db = new Database();
    $conn = $db->connect();
    
    // Get product details
    $query = "
        SELECT 
            p.*,
            c.code as category_code,
            c.name as category_name,
            c.icon as category_icon
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        WHERE p.id = :id AND p.is_active = 1
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':id', $productId, PDO::PARAM_INT);
    $stmt->execute();
    
    $product = $stmt->fetch();
    
    if (!$product) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Product not found',
            'code' => 'PRODUCT_NOT_FOUND'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Update view count
    $updateQuery = "UPDATE products SET view_count = view_count + 1 WHERE id = :id";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bindValue(':id', $productId, PDO::PARAM_INT);
    $updateStmt->execute();
    
    // Parse JSON features
    $features = json_decode($product['features'] ?? '[]', true);
    if (!is_array($features)) {
        $features = [];
    }
    
    // Format prices
    $price = floatval($product['price']);
    $originalPrice = $product['original_price'] ? floatval($product['original_price']) : null;
    
    // Calculate discount percentage
    $discountPercent = 0;
    if ($originalPrice && $originalPrice > $price) {
        $discountPercent = round((($originalPrice - $price) / $originalPrice) * 100);
    }
    
    // Format response
    $response = [
        'success' => true,
        'data' => [
            'id' => intval($product['id']),
            'name' => $product['name'],
            'slug' => $product['slug'],
            'description' => $product['description'],
            'short_description' => $product['short_description'],
            'price' => $price,
            'original_price' => $originalPrice,
            'discount_percent' => $discountPercent,
            'formatted_price' => DatabaseHelper::formatCurrency($price),
            'formatted_original_price' => $originalPrice ? DatabaseHelper::formatCurrency($originalPrice) : null,
            'image' => $product['image'],
            'features' => $features,
            'mixing_ratio' => $product['mixing_ratio'] ?? null,
            'badge' => $product['badge'],
            'in_stock' => boolval($product['in_stock']),
            'stock_quantity' => intval($product['stock_quantity']),
            'rating' => floatval($product['rating']),
            'review_count' => intval($product['review_count']),
            'view_count' => intval($product['view_count']) + 1, // Include the increment
            'is_featured' => boolval($product['is_featured']),
            'category_code' => $product['category_code'],
            'category_name' => $product['category_name'],
            'category_icon' => $product['category_icon'],
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at']
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("Product detail API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'code' => 'INTERNAL_SERVER_ERROR',
        'debug' => $e->getMessage() // Remove this in production
    ], JSON_UNESCAPED_UNICODE);
}
?>
