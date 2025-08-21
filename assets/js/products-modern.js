// Modern Products Page JavaScript
class ProductsApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.isLoading = false;
        this.searchQuery = '';
        this.totalProducts = 0;
        this.hasMore = false;
        // Auto-detect protocol and domain for API calls
        this.apiBaseUrl = `${window.location.protocol}//${window.location.host}/api/products`;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadProducts();
        this.loadStats();
        
        console.log('Products App initialized with MySQL backend');
        console.log('API Base URL:', this.apiBaseUrl);
    }

    /**
     * Safe API call with HTTPS fallback
     */
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            // If HTTPS fails and we're not already using HTTPS, try HTTP
            if (this.apiBaseUrl.startsWith('https:') && !window.location.protocol.startsWith('https:')) {
                try {
                    console.log('Trying HTTP fallback...');
                    const httpUrl = this.apiBaseUrl.replace('https:', 'http:');
                    const response = await fetch(`${httpUrl}${endpoint}`, options);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return await response.json();
                } catch (fallbackError) {
                    console.error('HTTP fallback also failed:', fallbackError);
                    throw fallbackError;
                }
            }
            throw error;
        }
    }

    /**
     * Load categories from API
     */
    async loadCategories() {
        try {
            const result = await this.apiCall('/categories');
            
            if (result.success) {
                this.categories = result.data;
            } else {
                console.error('Failed to load categories:', result.error);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    /**
     * Load products from API
     */
    async loadProducts(reset = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        if (reset) {
            this.currentPage = 1;
            this.showLoadingState();
        }

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.productsPerPage,
                category: this.currentFilter,
                search: this.searchQuery,
                sort: 'newest'
            });

            const result = await this.apiCall(`?${params}`);
            
            if (result.success) {
                const { products, pagination } = result.data;
                
                if (reset || this.currentPage === 1) {
                    this.products = products;
                    this.filteredProducts = products;
                } else {
                    // Append for load more
                    this.products = [...this.products, ...products];
                    this.filteredProducts = [...this.filteredProducts, ...products];
                }
                
                this.totalProducts = pagination.total;
                this.hasMore = pagination.has_more;
                
                this.renderProducts(reset);
                this.updateLoadMoreButton();
                this.updateShowingCount();
                
            } else {
                console.error('Failed to load products:', result.error);
                this.showErrorState(result.error);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showErrorState('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load stats from API
     */
    async loadStats() {
        try {
            const result = await this.apiCall('/stats');
            
            if (result.success) {
                this.updateStatsDisplay(result.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    /**
     * Update stats display
     */
    updateStatsDisplay(stats) {
        const statsNumbers = document.querySelectorAll('.product-stats .stat-number');
        if (statsNumbers.length >= 4) {
            statsNumbers[0].dataset.count = stats.products;
            statsNumbers[1].dataset.count = stats.categories;
            statsNumbers[2].dataset.count = stats.colors;
            statsNumbers[3].dataset.count = stats.customers;
            
            // Re-animate numbers
            statsNumbers.forEach((stat, index) => {
                setTimeout(() => {
                    this.animateNumber(stat);
                }, index * 100);
            });
        }
    }

    /**
     * Show error state
     */
    showErrorState(message) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Có lỗi xảy ra</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">${message}</p>
                <button class="btn btn-primary" onclick="window.productsApp.loadProducts(true)">
                    <i class="fas fa-redo" aria-hidden="true"></i>
                    Thử lại
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.loadProducts(true); // Reset and reload
            }, 300));
        }

        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn') || e.target.closest('.filter-btn')) {
                const filterBtn = e.target.closest('.filter-btn') || e.target;
                const filter = filterBtn.dataset.filter;
                if (filter) {
                    this.setActiveFilter(filter);
                }
            }
        });

        // Dropdown menu filters
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-filter]')) {
                const filter = e.target.dataset.filter;
                this.setActiveFilter(filter);
                
                // Scroll to products section
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    setTimeout(() => {
                        productsSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        });

        // Load more button
        const loadMoreBtn = document.querySelector('.btn-load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }

        // Reset filters
        const resetBtn = document.querySelector('.filter-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Initialize back to top button
        this.initBackToTop();
    }

    initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.classList.remove('visible');
                setTimeout(() => {
                    if (!backToTopBtn.classList.contains('visible')) {
                        backToTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn && activeBtn.classList.contains('filter-btn')) {
            activeBtn.classList.add('active');
        }
        
        this.loadProducts(true); // Reset and reload with new filter
    }

    resetFilters() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        
        // Reset search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]')?.classList.add('active');
        
        this.loadProducts(true); // Reset and reload
    }

    renderProducts(reset = false) {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        if (reset) {
            // Show loading state with animation
            this.showLoadingState();
        }

        setTimeout(() => {
            if (this.filteredProducts.length === 0 && !this.isLoading) {
                this.showEmptyState();
                return;
            }

            const productsHTML = this.filteredProducts.map((product, index) => {
                return this.createProductCard(product);
            }).join('');
            
            if (reset) {
                // Fade out old content
                grid.style.opacity = '0';
                grid.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    grid.innerHTML = productsHTML;
                    
                    // Fade in new content
                    grid.style.opacity = '1';
                    grid.style.transform = 'translateY(0)';
                    
                    // Stagger animation for product cards
                    const cards = grid.querySelectorAll('.product-card');
                    cards.forEach((card, index) => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(30px)';
                        card.style.transition = 'all 0.5s ease';
                        
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }, 300);
            } else {
                // Append new products for load more
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = productsHTML;
                const newCards = Array.from(tempDiv.children);
                
                newCards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    card.style.transition = 'all 0.5s ease';
                    grid.appendChild(card);
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        }, reset ? 300 : 0);
    }

    createProductCard(product) {
        const badgeHTML = product.badge ? `<span class="product-badge ${product.badge}">${this.getBadgeText(product.badge)}</span>` : '';
        const originalPriceHTML = product.original_price ? `<span class="price-original">${product.formatted_original_price}</span>` : '';
        const featuresHTML = product.features.slice(0, 3).map(feature => 
            `<span class="product-feature">${feature}</span>`
        ).join('');

        // Use API data structure
        const categoryName = product.category?.name || 'Sản phẩm';
        const categoryCode = product.category?.code || 'product';

        return `
            <div class="product-card" data-searchable="products" data-category="${categoryCode}" data-aos="fade-up">
                <div class="product-image">
                    ${badgeHTML}
                    <img src="${product.image}" alt="${product.name}" loading="lazy" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22250%22 viewBox=%220 0 300 250%22%3E%3Crect width=%22300%22 height=%22250%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%22150%22 y=%22125%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22Arial, sans-serif%22 font-size=%2216%22%3E${categoryName}%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="product-content">
                    <div class="product-category">${categoryName}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.short_description || product.description}</p>
                    <div class="product-features">
                        ${featuresHTML}
                    </div>
                    <div class="product-rating">
                        <div class="stars">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="rating-text">${product.rating} (${product.review_count} đánh giá)</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="price-current">${product.formatted_price}</span>
                            ${originalPriceHTML}
                            ${product.discount_percent > 0 ? `<span class="discount-percent">-${product.discount_percent}%</span>` : ''}
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-cart" onclick="addToCart(${product.id})" aria-label="Thêm ${product.name} vào giỏ hàng">
                                <i class="fas fa-cart-plus" aria-hidden="true"></i>
                            </button>
                            <button class="btn-quick-view" onclick="showProductModal(${product.id})" aria-label="Xem chi tiết ${product.name}">
                                <i class="fas fa-eye" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate star rating HTML
     */
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    }

    loadMoreProducts() {
        if (this.isLoading || !this.hasMore) return;
        
        const loadMoreBtn = document.querySelector('.btn-load-more');
        
        if (loadMoreBtn) {
            const originalHTML = loadMoreBtn.innerHTML;
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
            loadMoreBtn.disabled = true;
        }

        this.currentPage++;
        this.loadProducts(false).then(() => {
            if (loadMoreBtn) {
                loadMoreBtn.innerHTML = '<span>Xem thêm sản phẩm</span><i class="fas fa-plus"></i>';
                loadMoreBtn.disabled = false;
            }
        });
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.querySelector('.btn-load-more');
        if (!loadMoreBtn) return;

        loadMoreBtn.style.display = this.hasMore ? 'inline-flex' : 'none';
    }

    updateShowingCount() {
        const showingElement = document.getElementById('showingCount');
        const totalElement = document.getElementById('totalCount');
        
        if (showingElement && totalElement) {
            showingElement.textContent = this.filteredProducts.length;
            totalElement.textContent = this.totalProducts;
        }
    }

    /**
     * Animate number counters
     */
    animateNumber(element) {
        const target = parseInt(element.dataset.count);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (target >= 100 ? '+' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (target >= 100 ? '+' : '');
            }
        }, 30);
    }

    showLoadingState() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="products-loading">
                <div class="loading-skeleton">
                    ${Array(this.productsPerPage).fill(0).map(() => '<div class="skeleton-card"></div>').join('')}
                </div>
            </div>
        `;
    }

    showEmptyState() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="empty-products" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-search" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Không tìm thấy sản phẩm</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
                <button class="btn btn-primary" onclick="window.productsApp.resetFilters()">
                    <i class="fas fa-undo" aria-hidden="true"></i>
                    Đặt lại bộ lọc
                </button>
            </div>
        `;
    }

    getBadgeText(badge) {
        const badges = {
            new: 'Mới',
            sale: 'Giảm giá',
            hot: 'Hot',
            featured: 'Nổi bật'
        };
        return badges[badge] || badge;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    getProductById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}


// Global functions for compatibility
window.productsApp = null;

function filterProducts(filter) {
    if (window.productsApp) {
        window.productsApp.setActiveFilter(filter);
    }
}

function resetFilters() {
    if (window.productsApp) {
        window.productsApp.resetFilters();
    }
}

function loadMoreProducts() {
    if (window.productsApp) {
        window.productsApp.loadMoreProducts();
    }
}

async function addToCart(productId) {
    const product = window.productsApp?.getProductById(productId);
    if (!product) return;

    const productData = {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: product.image
    };

    if (window.app?.addToCart) {
        window.app.addToCart(productData);
    } else {
        console.log('Adding to cart:', productData);
        window.app?.showToast(`${product.name} đã được thêm vào giỏ hàng`, 'success');
    }
}

async function showProductModal(productId) {
    try {
        // Show loading in modal first
        const modal = document.getElementById('productModal');
        const modalContent = document.getElementById('productModalContent');
        
        if (!modal || !modalContent) return;
        
        modalContent.innerHTML = `
            <div class="product-modal-loading" style="text-align: center; padding: 3rem;">
                <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        `;
        
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        
        // Fetch product details from API
        const response = await fetch(`api/products/detail.php?id=${productId}`);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load product');
        }

        const product = result.data;
        
        const featuresHTML = product.features.map(feature => 
            `<li><i class="fas fa-check"></i> ${feature}</li>`
        ).join('');

        const badgeHTML = product.badge ? `<span class="product-badge ${product.badge}">${window.productsApp.getBadgeText(product.badge)}</span>` : '';
        
        const discountPercent = product.discount_percent || 0;

        modalContent.innerHTML = `
            <div class="product-modal-content">
                <div class="product-modal-image">
                    ${badgeHTML}
                    <img src="${product.image}" alt="${product.name}" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 viewBox=%220 0 400 400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%22200%22 y=%22200%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22Arial, sans-serif%22 font-size=%2220%22%3E${product.category_name || 'Sản phẩm'}%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="product-modal-details">
                    <div class="product-modal-category">
                        <i class="${product.category_icon || 'fas fa-tag'}" aria-hidden="true"></i>
                        ${product.category_name || 'Sản phẩm'}
                    </div>
                    <h3>${product.name}</h3>
                    
                    <div class="product-modal-rating">
                        <div class="rating-stars">
                            ${window.productsApp.generateStars(product.rating)}
                        </div>
                        <span class="rating-text">${product.rating} (${product.review_count} đánh giá)</span>
                    </div>
                    
                    <div class="product-modal-price">
                        <span class="current-price">${product.formatted_price}</span>
                        ${product.original_price ? `<span class="original-price">${product.formatted_original_price}</span>` : ''}
                        ${discountPercent > 0 ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
                    </div>

                    <div class="stock-status ${product.in_stock ? 'in-stock' : 'out-of-stock'}">
                        <i class="fas ${product.in_stock ? 'fa-check-circle' : 'fa-times-circle'}" aria-hidden="true"></i>
                        ${product.in_stock ? `Còn hàng (${product.stock_quantity} sản phẩm)` : 'Hết hàng'}
                    </div>
                    
                    <p class="product-modal-description">${product.description}</p>
                    
                    <div class="product-modal-specs">
                        <h4><i class="fas fa-cogs" aria-hidden="true"></i> Thông số kỹ thuật</h4>
                        <div class="spec-grid">
                            <div class="spec-item">
                                <span class="spec-label">Mã sản phẩm:</span>
                                <span class="spec-value">#${String(product.id).padStart(4, '0')}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Danh mục:</span>
                                <span class="spec-value">${product.category_name}</span>
                            </div>
                            ${product.mixing_ratio ? `
                            <div class="spec-item">
                                <span class="spec-label">Tỉ lệ pha:</span>
                                <span class="spec-value mixing-ratio">${product.mixing_ratio}</span>
                            </div>
                            ` : ''}
                            <div class="spec-item">
                                <span class="spec-label">Số lượng tồn:</span>
                                <span class="spec-value">${product.stock_quantity} sản phẩm</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Lượt xem:</span>
                                <span class="spec-value">${product.view_count || 0} lượt</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-modal-features">
                        <h4><i class="fas fa-star" aria-hidden="true"></i> Tính năng nổi bật</h4>
                        <ul>${featuresHTML}</ul>
                    </div>
                    
                    <div class="product-modal-actions">
                        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeProductModal();" ${!product.in_stock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus" aria-hidden="true"></i>
                            ${product.in_stock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                        </button>
                        <button class="btn btn-secondary" onclick="closeProductModal()">
                            <i class="fas fa-times" aria-hidden="true"></i>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Focus management
        const firstButton = modal.querySelector('.btn-primary');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 100);
        }

    } catch (error) {
        console.error('Error loading product details:', error);
        
        const modalContent = document.getElementById('productModalContent');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="product-modal-error" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                    <h3>Có lỗi xảy ra</h3>
                    <p>Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.</p>
                    <button class="btn btn-primary" onclick="closeProductModal()" style="margin-top: 1rem;">
                        Đóng
                    </button>
                </div>
            `;
        }
        
        window.app?.showToast('Có lỗi xảy ra khi tải thông tin sản phẩm', 'error');
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function toggleAccordion(button) {
    const accordionItem = button.closest('.accordion-item');
    const isActive = accordionItem.classList.contains('active');
    
    // Close all accordion items
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        accordionItem.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsApp;
}
