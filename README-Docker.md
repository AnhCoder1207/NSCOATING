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
# Sử dụng management script
./docker-manage.sh reset

# Hoặc manual
docker compose down -v
docker system prune -a
```

### Rebuild container

```bash
# Sử dụng management script
./docker-manage.sh rebuild

# Hoặc manual
docker compose up -d --build web
```

### Debug và logs

```bash
# Xem logs với management script
./docker-manage.sh logs
./docker-manage.sh logs-web
./docker-manage.sh logs-mysql

# Vào shell containers
./docker-manage.sh shell-web
./docker-manage.sh shell-mysql
```

## Management Script

File `docker-manage.sh` cung cấp các lệnh tiện ích:

```bash
# Hiển thị help
./docker-manage.sh help

# Các lệnh chính
./docker-manage.sh start      # Khởi động
./docker-manage.sh stop       # Dừng
./docker-manage.sh restart    # Restart
./docker-manage.sh status     # Trạng thái
./docker-manage.sh info       # Thông tin truy cập
./docker-manage.sh reset      # Reset hoàn toàn
```

## Environment Configuration

Copy file `.env.example` thành `.env` để tùy chỉnh cấu hình:

```bash
cp .env.example .env
```

Sau đó chỉnh sửa `.env` theo nhu cầu và restart containers.

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