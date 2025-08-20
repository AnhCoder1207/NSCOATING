#!/bin/bash

# NS COATING Docker Setup Script
echo "🎨 NS COATING - Docker Setup"
echo "=========================="

# Kiểm tra Docker có được cài đặt
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt. Vui lòng cài đặt Docker trước."
    exit 1
fi

# Kiểm tra Docker Compose (V2)
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

echo "✅ Docker và Docker Compose đã được cài đặt"

# Build và start containers
echo ""
echo "🚀 Đang build và start containers..."
docker compose up -d --build

# Chờ MySQL khởi động
echo ""
echo "⏳ Đang chờ MySQL khởi động..."
sleep 10

# Kiểm tra status containers
echo ""
echo "📊 Trạng thái containers:"
docker compose ps

# Hiển thị thông tin truy cập
echo ""
echo "🌐 Thông tin truy cập:"
echo "   - Website: http://localhost:8080"
echo "   - PhpMyAdmin: http://localhost:8081"
echo "   - MySQL: localhost:3306"
echo ""
echo "🔑 Thông tin database:"
echo "   - Database: ns_coating"
echo "   - Username: nscoating_user"
echo "   - Password: nscoating_pass"
echo "   - Root Password: rootpassword"
echo ""
echo "🎉 Setup hoàn tất! Truy cập http://localhost:8080 để xem website."
echo ""
echo "📝 Để dừng containers, chạy: docker compose down"
echo "📝 Để xem logs, chạy: docker compose logs -f"