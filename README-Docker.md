# NS COATING - Docker Setup

Hướng dẫn setup và chạy dự án NS COATING bằng Docker.

## Yêu cầu hệ thống

- Docker
- Docker Compose V2

## Cách sử dụng

### 1. Khởi động dự án

```bash
# Cách 1: Sử dụng script
./start.sh

# Cách 2: Sử dụng docker compose trực tiếp
docker compose up -d --build
```

### 2. Truy cập website

- **Website chính**: http://localhost:8080
- **PhpMyAdmin**: http://localhost:8081
- **MySQL**: localhost:3306

### 3. Thông tin database

- **Database**: ns_coating
- **Username**: nscoating_user
- **Password**: nscoating_pass
- **Root Password**: rootpassword

### 4. Dừng dự án

```bash
# Cách 1: Sử dụng script
./stop.sh

# Cách 2: Sử dụng docker compose trực tiếp
docker compose down
```

### 5. Xem logs

```bash
# Xem logs tất cả services
docker compose logs -f

# Xem logs một service cụ thể
docker compose logs -f web
docker compose logs -f mysql
```

## Cấu trúc Docker

### Services

1. **web**: Container chạy Apache + PHP 8.2
2. **mysql**: Container chạy MySQL 8.0
3. **phpmyadmin**: Container quản lý database

### Volumes

- `mysql_data`: Lưu trữ dữ liệu MySQL

### Network

- `nscoating_network`: Mạng nội bộ cho các containers giao tiếp

## Troubleshooting

### Port đã được sử dụng

Nếu port 8080 hoặc 3306 đã được sử dụng, có thể thay đổi trong file `docker-compose.yml`:

```yaml
ports:
  - "8081:80"  # Thay đổi 8080 thành 8081
```

### Xóa dữ liệu và reset

```bash
# Dừng và xóa tất cả containers, volumes
docker-compose down -v

# Xóa images (nếu cần)
docker system prune -a
```

### Rebuild container

```bash
# Rebuild container web
docker-compose up -d --build web

# Hoặc rebuild tất cả
docker-compose up -d --build
```

## Cấu hình

### Database Configuration

File cấu hình database tự động detect môi trường Docker và sử dụng thông tin kết nối phù hợp.

### PHP Configuration

- Upload max size: 50MB
- Memory limit: 256MB
- Max execution time: 300s
- Timezone: Asia/Ho_Chi_Minh

### Apache Configuration

- Document root: /var/www/html
- .htaccess enabled
- URL rewriting enabled
- Static file caching enabled