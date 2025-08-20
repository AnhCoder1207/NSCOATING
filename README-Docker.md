# NS COATING - Docker Setup

Hướng dẫn setup và chạy dự án NS COATING bằng Docker.

## Yêu cầu hệ thống

- Docker
- Docker Compose V2

## Cách sử dụng

### 1. Khởi động dự án

```bash
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