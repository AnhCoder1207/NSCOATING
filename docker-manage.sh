#!/bin/bash

# NS COATING Docker Management Script
echo "🔧 NS COATING - Docker Management"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo "Cách sử dụng: $0 [command]"
    echo ""
    echo "Các lệnh có sẵn:"
    echo "  start       - Khởi động containers"
    echo "  stop        - Dừng containers"
    echo "  restart     - Restart containers"
    echo "  status      - Hiển thị trạng thái containers"
    echo "  logs        - Xem logs tất cả services"
    echo "  logs-web    - Xem logs web service"
    echo "  logs-mysql  - Xem logs MySQL service"
    echo "  reset       - Reset hoàn toàn (xóa containers và volumes)"
    echo "  rebuild     - Rebuild container web"
    echo "  shell-web   - Vào shell của web container"
    echo "  shell-mysql - Vào MySQL shell"
    echo "  info        - Hiển thị thông tin truy cập"
    echo "  help        - Hiển thị help này"
    echo ""
}

start_containers() {
    echo -e "${BLUE}🚀 Khởi động containers...${NC}"
    docker compose up -d
    echo -e "${GREEN}✅ Containers đã được khởi động${NC}"
    show_info
}

stop_containers() {
    echo -e "${YELLOW}🛑 Dừng containers...${NC}"
    docker compose down
    echo -e "${GREEN}✅ Containers đã được dừng${NC}"
}

restart_containers() {
    echo -e "${YELLOW}🔄 Restart containers...${NC}"
    docker compose restart
    echo -e "${GREEN}✅ Containers đã được restart${NC}"
}

show_status() {
    echo -e "${BLUE}📊 Trạng thái containers:${NC}"
    docker compose ps
}

show_logs() {
    echo -e "${BLUE}📋 Logs tất cả services:${NC}"
    docker compose logs -f
}

show_logs_web() {
    echo -e "${BLUE}📋 Logs web service:${NC}"
    docker compose logs -f web
}

show_logs_mysql() {
    echo -e "${BLUE}📋 Logs MySQL service:${NC}"
    docker compose logs -f mysql
}

reset_environment() {
    echo -e "${RED}⚠️  CẢNH BÁO: Điều này sẽ xóa TẤT CẢ containers và dữ liệu database!${NC}"
    read -p "Bạn có chắc chắn muốn tiếp tục? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}🗑️  Xóa containers và volumes...${NC}"
        docker compose down -v
        docker system prune -f
        echo -e "${GREEN}✅ Reset hoàn tất${NC}"
    else
        echo -e "${YELLOW}❌ Hủy bỏ reset${NC}"
    fi
}

rebuild_web() {
    echo -e "${BLUE}🔨 Rebuild web container...${NC}"
    docker compose build web
    docker compose up -d web
    echo -e "${GREEN}✅ Web container đã được rebuild${NC}"
}

shell_web() {
    echo -e "${BLUE}💻 Vào shell của web container...${NC}"
    docker compose exec web bash
}

shell_mysql() {
    echo -e "${BLUE}💻 Vào MySQL shell...${NC}"
    docker compose exec mysql mysql -u nscoating_user -p ns_coating
}

show_info() {
    echo ""
    echo -e "${GREEN}🌐 Thông tin truy cập:${NC}"
    echo -e "   - Website: ${BLUE}http://localhost:8080${NC}"
    echo -e "   - PhpMyAdmin: ${BLUE}http://localhost:8081${NC}"
    echo -e "   - MySQL: ${BLUE}localhost:3306${NC}"
    echo ""
    echo -e "${GREEN}🔑 Thông tin database:${NC}"
    echo -e "   - Database: ${YELLOW}ns_coating${NC}"
    echo -e "   - Username: ${YELLOW}nscoating_user${NC}"
    echo -e "   - Password: ${YELLOW}nscoating_pass${NC}"
    echo -e "   - Root Password: ${YELLOW}rootpassword${NC}"
    echo ""
}

# Main script logic
case "$1" in
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    logs-web)
        show_logs_web
        ;;
    logs-mysql)
        show_logs_mysql
        ;;
    reset)
        reset_environment
        ;;
    rebuild)
        rebuild_web
        ;;
    shell-web)
        shell_web
        ;;
    shell-mysql)
        shell_mysql
        ;;
    info)
        show_info
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        echo -e "${RED}❌ Vui lòng chỉ định một command${NC}"
        echo ""
        show_help
        exit 1
        ;;
    *)
        echo -e "${RED}❌ Command không hợp lệ: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac