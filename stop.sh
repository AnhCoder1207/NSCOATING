#!/bin/bash

# NS COATING Docker Stop Script
echo "🛑 NS COATING - Dừng Docker Containers"
echo "===================================="

echo "🔄 Đang dừng containers..."
docker compose down

echo ""
echo "📊 Trạng thái containers sau khi dừng:"
docker compose ps

echo ""
echo "✅ Đã dừng tất cả containers."
echo "📝 Để start lại, chạy: ./start.sh hoặc docker compose up -d"
echo "📝 Để xóa volumes (dữ liệu database), chạy: docker compose down -v"