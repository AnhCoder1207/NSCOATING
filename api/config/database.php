<?php

class Database {
    private $host = 'localhost';
    private $db_name = 'ns_coating';
    private $username = 'root'; 
    private $password = '';    
    private $charset = 'utf8mb4';
    private $conn = null;

    /**
     * Kết nối database
     */
    public function connect() {
        if ($this->conn === null) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ];
                
                // Only add MySQL specific options if available
                if (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
                    $options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES {$this->charset}";
                }
                
                $this->conn = new PDO($dsn, $this->username, $this->password, $options);
                
                // Set charset and timezone manually if MySQL extension not available
                if (!defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
                    $this->conn->exec("SET NAMES {$this->charset}");
                }
                $this->conn->exec("SET time_zone = '+07:00'");
                
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Kết nối cơ sở dữ liệu thất bại: " . $e->getMessage());
            }
        }
        
        return $this->conn;
    }

    /**
     * Đóng kết nối
     */
    public function disconnect() {
        $this->conn = null;
    }

    /**
     * Kiểm tra kết nối
     */
    public function testConnection() {
        try {
            $conn = $this->connect();
            $stmt = $conn->query("SELECT 1");
            return $stmt !== false;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Lấy thông tin database
     */
    public function getDatabaseInfo() {
        try {
            $conn = $this->connect();
            $stmt = $conn->query("SELECT DATABASE() as db_name, VERSION() as db_version");
            return $stmt->fetch();
        } catch (Exception $e) {
            return null;
        }
    }
}

/**
 * Utility functions for database operations
 */
class DatabaseHelper {
    
    /**
     * Sanitize input data
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        return $data;
    }

    /**
     * Generate UUID v4
     */
    public static function generateUuid() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    /**
     * Format Vietnamese currency
     */
    public static function formatCurrency($amount) {
        return number_format($amount, 0, ',', '.') . '₫';
    }

    /**
     * Create SEO friendly slug
     */
    public static function createSlug($string) {
        // Vietnamese characters mapping
        $vietnamese = [
            'à','á','ạ','ả','ã','â','ầ','ấ','ậ','ẩ','ẫ','ă','ằ','ắ','ặ','ẳ','ẵ',
            'è','é','ẹ','ẻ','ẽ','ê','ề','ế','ệ','ể','ễ',
            'ì','í','ị','ỉ','ĩ',
            'ò','ó','ọ','ỏ','õ','ô','ồ','ố','ộ','ổ','ỗ','ơ','ờ','ớ','ợ','ở','ỡ',
            'ù','ú','ụ','ủ','ũ','ư','ừ','ứ','ự','ử','ữ',
            'ỳ','ý','ỵ','ỷ','ỹ',
            'đ',
            'À','Á','Ạ','Ả','Ã','Â','Ầ','Ấ','Ậ','Ẩ','Ẫ','Ă','Ằ','Ắ','Ặ','Ẳ','Ẵ',
            'È','É','Ẹ','Ẻ','Ẽ','Ê','Ề','Ế','Ệ','Ể','Ễ',
            'Ì','Í','Ị','Ỉ','Ĩ',
            'Ò','Ó','Ọ','Ỏ','Õ','Ô','Ồ','Ố','Ộ','Ổ','Ỗ','Ơ','Ờ','Ớ','Ợ','Ở','Ỡ',
            'Ù','Ú','Ụ','Ủ','Ũ','Ư','Ừ','Ứ','Ự','Ử','Ữ',
            'Ỳ','Ý','Ỵ','Ỷ','Ỹ',
            'Đ'
        ];
        
        $english = [
            'a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a',
            'e','e','e','e','e','e','e','e','e','e','e',
            'i','i','i','i','i',
            'o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o',
            'u','u','u','u','u','u','u','u','u','u','u',
            'y','y','y','y','y',
            'd',
            'A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A',
            'E','E','E','E','E','E','E','E','E','E','E',
            'I','I','I','I','I',
            'O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O','O',
            'U','U','U','U','U','U','U','U','U','U','U',
            'Y','Y','Y','Y','Y',
            'D'
        ];
        
        $string = str_replace($vietnamese, $english, $string);
        $string = preg_replace('/[^a-zA-Z0-9\s]/', '', $string);
        $string = preg_replace('/\s+/', '-', trim($string));
        $string = strtolower($string);
        
        return $string;
    }
}

// Global error handling
function handleDatabaseError($e) {
    error_log("Database Error: " . $e->getMessage());
    
    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => 'Có lỗi xảy ra với cơ sở dữ liệu. Vui lòng thử lại sau.',
            'code' => 'DATABASE_ERROR'
        ]);
        exit;
    }
}

// Set default timezone
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Set error reporting for development
if (!defined('PRODUCTION')) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
?>
