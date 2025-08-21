<?php
/**
 * Products API Endpoint
 * API để lấy danh sách sản phẩm từ MySQL
 */

// Force HTTPS if request comes from HTTPS
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// Check if running on HTTPS
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
           || $_SERVER['SERVER_PORT'] == 443
           || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Add security headers for HTTPS
if ($isHttps) {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

class ProductsAPI {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->connect();
    }

    /**
     * Lấy danh sách sản phẩm với phân trang và lọc
     */
    public function getProducts($params = []) {
        try {
            // Default parameters
            $page = max(1, intval($params['page'] ?? 1));
            $limit = min(50, max(1, intval($params['limit'] ?? 12)));
            $category = $params['category'] ?? 'all';
            $search = trim($params['search'] ?? '');
            $sort = $params['sort'] ?? 'newest';
            $featured = $params['featured'] ?? '';
            
            $offset = ($page - 1) * $limit;

            // Build WHERE clause
            $whereConditions = ['p.is_active = 1'];
            $bindParams = [];

            // Category filter
            if ($category !== 'all' && !empty($category)) {
                $whereConditions[] = 'c.code = :category';
                $bindParams['category'] = $category;
            }

            // Search filter
            if (!empty($search)) {
                $whereConditions[] = '(p.name LIKE :search OR p.description LIKE :search OR p.short_description LIKE :search)';
                $bindParams['search'] = '%' . $search . '%';
            }

            // Featured filter
            if ($featured === 'true') {
                $whereConditions[] = 'p.is_featured = 1';
            }

            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);

            // Build ORDER BY clause
            $orderBy = $this->buildOrderBy($sort);

            // Count total records
            $countQuery = "
                SELECT COUNT(*) as total
                FROM products p
                INNER JOIN categories c ON p.category_id = c.id
                $whereClause
            ";

            $countStmt = $this->conn->prepare($countQuery);
            foreach ($bindParams as $key => $value) {
                $countStmt->bindValue(':' . $key, $value);
            }
            $countStmt->execute();
            $totalProducts = $countStmt->fetch()['total'];

            // Get products
            $query = "
                SELECT 
                    p.id,
                    p.name,
                    p.slug,
                    p.description,
                    p.short_description,
                    p.price,
                    p.original_price,
                    p.image,
                    p.features,
                    p.mixing_ratio,
                    p.badge,
                    p.in_stock,
                    p.stock_quantity,
                    p.rating,
                    p.review_count,
                    p.view_count,
                    p.is_featured,
                    c.code as category_code,
                    c.name as category_name,
                    c.icon as category_icon,
                    p.created_at,
                    p.updated_at
                FROM products p
                INNER JOIN categories c ON p.category_id = c.id
                $whereClause
                $orderBy
                LIMIT :limit OFFSET :offset
            ";

            $stmt = $this->conn->prepare($query);
            foreach ($bindParams as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $products = $stmt->fetchAll();

            // Process products data
            $processedProducts = array_map([$this, 'processProduct'], $products);

            // Calculate pagination info
            $totalPages = ceil($totalProducts / $limit);
            $hasMore = $page < $totalPages;

            return [
                'success' => true,
                'data' => [
                    'products' => $processedProducts,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $limit,
                        'total' => $totalProducts,
                        'total_pages' => $totalPages,
                        'has_more' => $hasMore,
                        'from' => $offset + 1,
                        'to' => min($offset + $limit, $totalProducts)
                    ],
                    'filters' => [
                        'category' => $category,
                        'search' => $search,
                        'sort' => $sort,
                        'featured' => $featured
                    ]
                ]
            ];

        } catch (Exception $e) {
            handleDatabaseError($e);
            return [
                'success' => false,
                'error' => 'Không thể lấy danh sách sản phẩm',
                'code' => 'FETCH_PRODUCTS_ERROR'
            ];
        }
    }

    /**
     * Lấy thông tin chi tiết sản phẩm
     */
    public function getProduct($id) {
        try {
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

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $product = $stmt->fetch();

            if (!$product) {
                return [
                    'success' => false,
                    'error' => 'Không tìm thấy sản phẩm',
                    'code' => 'PRODUCT_NOT_FOUND'
                ];
            }

            // Update view count
            $this->updateViewCount($id);

            return [
                'success' => true,
                'data' => $this->processProduct($product)
            ];

        } catch (Exception $e) {
            handleDatabaseError($e);
            return [
                'success' => false,
                'error' => 'Không thể lấy thông tin sản phẩm',
                'code' => 'FETCH_PRODUCT_ERROR'
            ];
        }
    }

    /**
     * Lấy danh sách categories
     */
    public function getCategories() {
        try {
            $query = "
                SELECT 
                    c.*,
                    COUNT(p.id) as product_count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
                WHERE c.is_active = 1
                GROUP BY c.id
                ORDER BY c.sort_order ASC, c.name ASC
            ";

            $stmt = $this->conn->query($query);
            $categories = $stmt->fetchAll();

            return [
                'success' => true,
                'data' => $categories
            ];

        } catch (Exception $e) {
            handleDatabaseError($e);
            return [
                'success' => false,
                'error' => 'Không thể lấy danh sách danh mục',
                'code' => 'FETCH_CATEGORIES_ERROR'
            ];
        }
    }

    /**
     * Lấy thống kê sản phẩm
     */
    public function getStats() {
        try {
            $query = "
                SELECT 
                    COUNT(*) as total_products,
                    COUNT(DISTINCT category_id) as total_categories,
                    COALESCE(SUM(view_count), 0) as total_views,
                    COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_products
                FROM products
                WHERE is_active = 1
            ";

            $stmt = $this->conn->query($query);
            $stats = $stmt->fetch();

            return [
                'success' => true,
                'data' => [
                    'products' => intval($stats['total_products']),
                    'categories' => intval($stats['total_categories']),
                    'views' => intval($stats['total_views']),
                    'featured' => intval($stats['featured_products']),
                    'colors' => 100, // Static value
                    'customers' => 1000 // Static value
                ]
            ];

        } catch (Exception $e) {
            handleDatabaseError($e);
            return [
                'success' => false,
                'error' => 'Không thể lấy thống kê',
                'code' => 'FETCH_STATS_ERROR'
            ];
        }
    }

    /**
     * Process product data
     */
    private function processProduct($product) {
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

        return [
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
            'view_count' => intval($product['view_count']),
            'is_featured' => boolval($product['is_featured']),
            'category_code' => $product['category_code'],
            'category_name' => $product['category_name'],
            'category_icon' => $product['category_icon'],
            'category' => [
                'code' => $product['category_code'],
                'name' => $product['category_name'],
                'icon' => $product['category_icon']
            ],
            'created_at' => $product['created_at'],
            'updated_at' => $product['updated_at']
        ];
    }

    /**
     * Build ORDER BY clause
     */
    private function buildOrderBy($sort) {
        $orderByMap = [
            'newest' => 'p.created_at DESC',
            'oldest' => 'p.created_at ASC',
            'price_asc' => 'p.price ASC',
            'price_desc' => 'p.price DESC',
            'name_asc' => 'p.name ASC',
            'name_desc' => 'p.name DESC',
            'rating' => 'p.rating DESC, p.review_count DESC',
            'popular' => 'p.view_count DESC, p.rating DESC'
        ];

        return 'ORDER BY ' . ($orderByMap[$sort] ?? $orderByMap['newest']);
    }

    /**
     * Update product view count
     */
    private function updateViewCount($productId) {
        try {
            $query = "UPDATE products SET view_count = view_count + 1 WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':id', $productId, PDO::PARAM_INT);
            $stmt->execute();
        } catch (Exception $e) {
            // Silent fail for view count update
            error_log("Failed to update view count: " . $e->getMessage());
        }
    }
}

// Handle API requests
try {
    $api = new ProductsAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['PATH_INFO'] ?? '';
    
    // Check for product ID in URL or GET parameter
    $productId = null;
    if (isset($_GET['id'])) {
        $productId = $_GET['id'];
    } elseif (preg_match('/^\/(\d+)$/', $path, $matches)) {
        $productId = $matches[1];
    }
    
    switch ($method) {
        case 'GET':
            if ($productId) {
                // Get single product
                $result = $api->getProduct($productId);
            } elseif ($path === '/categories' || isset($_GET['action']) && $_GET['action'] === 'categories') {
                // Get categories
                $result = $api->getCategories();
            } elseif ($path === '/stats' || isset($_GET['action']) && $_GET['action'] === 'stats') {
                // Get stats
                $result = $api->getStats();
            } else {
                // Get products list
                $result = $api->getProducts($_GET);
            }
            break;
            
        default:
            http_response_code(405);
            $result = [
                'success' => false,
                'error' => 'Method not allowed',
                'code' => 'METHOD_NOT_ALLOWED'
            ];
            break;
    }
    
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    handleDatabaseError($e);
}
?>
