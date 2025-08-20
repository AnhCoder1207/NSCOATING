// Modern NS COATING App - Enhanced JavaScript
class NSCoatingApp {
    constructor() {
        this.cart = this.loadCart();
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartUI();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupLazyLoading();
        this.initializeComponents();
        
        console.log('NS COATING App initialized');
    }

    setupEventListeners() {
        // Scroll events
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Resize events
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('contact-form')) {
                this.handleContactForm(e);
            }
        });

        // Click events with delegation
        document.addEventListener('click', (e) => {
            this.handleGlobalClicks(e);
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset;
        const header = document.getElementById('header');
        const backToTop = document.getElementById('backToTop');

        // Header scroll effect
        if (scrollTop > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        // Back to top button
        if (backToTop) {
            if (scrollTop > 300) {
                backToTop.style.display = 'flex';
                backToTop.style.opacity = '1';
            } else {
                backToTop.style.opacity = '0';
                setTimeout(() => {
                    if (window.pageYOffset <= 300) {
                        backToTop.style.display = 'none';
                    }
                }, 300);
            }
        }

        // Parallax effects
        this.updateParallaxElements(scrollTop);
    }

    updateParallaxElements(scrollTop) {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const translateY = scrollTop * speed;
            element.style.transform = `translateY(${translateY}px)`;
        });
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 1024) {
            this.closeMobileMenu();
        }

        // Update any size-dependent calculations
        this.updateResponsiveElements();
    }

    updateResponsiveElements() {
        // Update grid layouts if needed
        const productGrids = document.querySelectorAll('.product-categories');
        productGrids.forEach(grid => {
            // Dynamic grid adjustments can be made here
        });
    }

    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'Escape':
                this.closeAllModals();
                this.closeMobileMenu();
                break;
            case 'Tab':
                this.handleTabNavigation(e);
                break;
        }
    }

    handleTabNavigation(e) {
        // Trap focus in modals
        const openModal = document.querySelector('.modal:not(.hidden)');
        if (openModal) {
            const focusableElements = openModal.querySelectorAll(
                'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    handleGlobalClicks(e) {
        const target = e.target.closest('[data-action]');
        if (target) {
            const action = target.dataset.action;
            const data = target.dataset;
            
            switch (action) {
                case 'add-to-cart':
                    this.addToCart(data);
                    break;
                case 'remove-from-cart':
                    this.removeFromCart(data.productId);
                    break;
                case 'update-quantity':
                    this.updateQuantity(data.productId, parseInt(data.quantity));
                    break;
                case 'toggle-modal':
                    this.toggleModal(data.target);
                    break;
                case 'scroll-to':
                    this.scrollToElement(data.target);
                    break;
            }
        }
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.scrollToElement(target, 1000);
                }
            });
        });
    }

    scrollToElement(element, duration = 800) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;

        const targetPosition = element.offsetTop - 100; // Account for fixed header
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const ease = this.easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + (distance * ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementInView(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animations
        document.querySelectorAll('[data-observe]').forEach(el => {
            observer.observe(el);
        });

        // Counter animation
        const statsSection = document.querySelector('.statistics-section');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    handleElementInView(element) {
        if (element.classList.contains('statistics-section')) {
            this.animateCounters();
        }

        // Add any other intersection-based animations here
        element.classList.add('in-view');
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            let current = 0;
            const increment = target / 60; // 60 frames for smooth animation
            const suffix = target === 24 ? '' : '+';

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + suffix;
                }
            };

            updateCounter();
        });
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    initializeComponents() {
        // Initialize tooltips
        this.initializeTooltips();
        
        // Initialize form validation
        this.initializeFormValidation();
        
        // Initialize search functionality
        this.initializeSearch();
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip.bind(this));
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    showTooltip(e) {
        const text = e.target.dataset.tooltip;
        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

        setTimeout(() => tooltip.classList.add('visible'), 10);
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    initializeFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let message = '';

        // Required field validation
        if (field.required && !value) {
            isValid = false;
            message = 'Trường này là bắt buộc';
        }

        // Email validation
        if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Email không hợp lệ';
        }

        // Phone validation
        if (type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            message = 'Số điện thoại không hợp lệ';
        }

        this.showFieldValidation(field, isValid, message);
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    showFieldValidation(field, isValid, message) {
        // Remove existing validation
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('field-error', 'field-success');

        if (!isValid) {
            field.classList.add('field-error');
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            errorElement.textContent = message;
            field.parentNode.appendChild(errorElement);
        } else if (field.value.trim()) {
            field.classList.add('field-success');
        }
    }

    initializeSearch() {
        const searchInputs = document.querySelectorAll('[data-search]');
        searchInputs.forEach(input => {
            input.addEventListener('input', this.debounce((e) => {
                this.performSearch(e.target.value, e.target.dataset.search);
            }, 300));
        });
    }

    performSearch(query, target) {
        const searchableElements = document.querySelectorAll(`[data-searchable="${target}"]`);
        
        if (!query.trim()) {
            searchableElements.forEach(el => {
                el.style.display = '';
            });
            return;
        }

        searchableElements.forEach(el => {
            const text = el.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            el.style.display = matches ? '' : 'none';
        });
    }

    // Cart Management
    addToCart(productData) {
        const product = {
            id: productData.id || Date.now().toString(),
            name: productData.name || '',
            price: parseFloat(productData.price) || 0,
            image: productData.image || '',
            quantity: 1
        };

        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(product);
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`${product.name} đã được thêm vào giỏ hàng`, 'success');
        this.animateCartIcon();
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index > -1) {
            const removedItem = this.cart.splice(index, 1)[0];
            this.saveCart();
            this.updateCartUI();
            this.showToast(`${removedItem.name} đã được xóa khỏi giỏ hàng`, 'info');
        }
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.showToast('Giỏ hàng đã được xóa', 'info');
    }

    saveCart() {
        try {
            localStorage.setItem('nscoating_cart', JSON.stringify(this.cart));
        } catch (e) {
            console.warn('Could not save cart to localStorage:', e);
        }
    }

    loadCart() {
        try {
            const saved = localStorage.getItem('nscoating_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Could not load cart from localStorage:', e);
            return [];
        }
    }

    updateCartUI() {
        const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Update cart count badges
        const countElements = document.querySelectorAll('#cartCount, #mobileCartCount');
        countElements.forEach(el => {
            el.textContent = cartCount;
            el.style.display = cartCount > 0 ? 'block' : 'none';
        });

        // Update cart total
        const totalElements = document.querySelectorAll('#subtotalAmount, #totalAmount');
        totalElements.forEach(el => {
            el.textContent = this.formatPrice(cartTotal);
        });

        this.renderCart();
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = emptyCart ? emptyCart.outerHTML : '';
            return;
        }

        const cartHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">${this.formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="app.updateQuantity('${item.id}', ${item.quantity - 1})" aria-label="Giảm số lượng">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="app.updateQuantity('${item.id}', ${item.quantity + 1})" aria-label="Tăng số lượng">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    ${this.formatPrice(item.price * item.quantity)}
                </div>
                <button class="cart-item-remove" onclick="app.removeFromCart('${item.id}')" aria-label="Xóa sản phẩm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        cartItems.innerHTML = cartHTML;
    }

    animateCartIcon() {
        const cartIcons = document.querySelectorAll('.cart-btn i');
        cartIcons.forEach(icon => {
            icon.classList.add('animate-bounce');
            setTimeout(() => {
                icon.classList.remove('animate-bounce');
            }, 600);
        });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    // Modal Management
    toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const isHidden = modal.classList.contains('hidden');
            modal.classList.toggle('hidden');
            modal.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
            
            if (!isHidden) {
                // Focus first focusable element when opening
                const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
                if (firstFocusable) {
                    setTimeout(() => firstFocusable.focus(), 100);
                }
            }
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
        }
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        icon.className = `toast-icon ${icons[type] || icons.info}`;
        messageEl.textContent = message;
        toast.className = `toast ${type}`;

        // Auto hide
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);

        // Make announcement for screen readers
        this.announceToScreenReader(message);
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Utility Functions
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Performance Monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    // Error Handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        this.showToast('Đã xảy ra lỗi. Vui lòng thử lại.', 'error');
    }

    // Analytics (placeholder for future implementation)
    trackEvent(eventName, properties = {}) {
        console.log('Event tracked:', eventName, properties);
        // Implement analytics tracking here
    }
}

// Global utility functions for backward compatibility
function toggleCart() {
    window.app?.toggleModal('cartModal');
}

function toggleLoginModal() {
    window.app?.toggleModal('loginModal');
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;
    
    if (mobileMenu) {
        const isActive = mobileMenu.classList.contains('active');
        mobileMenu.classList.toggle('active');
        mobileMenu.setAttribute('aria-hidden', isActive ? 'true' : 'false');
        body.style.overflow = isActive ? 'auto' : 'hidden';
    }
}

function toggleMobileDropdown(element) {
    const dropdown = element.closest('.mobile-dropdown');
    if (dropdown) {
        document.querySelectorAll('.mobile-dropdown.active').forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove('active');
                otherDropdown.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
            }
        });
        
        const isActive = dropdown.classList.contains('active');
        dropdown.classList.toggle('active');
        element.setAttribute('aria-expanded', isActive ? 'false' : 'true');
    }
}

function closeMobileMenu() {
    window.app?.closeMobileMenu();
}

function checkout() {
    if (!window.app?.cart?.length) {
        window.app?.showToast('Giỏ hàng đang trống!', 'error');
        return;
    }

    window.app?.showToast('Đang xử lý đơn hàng...', 'info');
    
    setTimeout(() => {
        const total = window.app.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        window.app.showToast(`Đặt hàng thành công! Tổng tiền: ${window.app.formatPrice(total)}`, 'success');
        window.app.clearCart();
        window.app.toggleModal('cartModal');
        window.app.trackEvent('checkout_completed', { total, items: window.app.cart.length });
    }, 1000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NSCoatingApp();
    
    // Initialize AOS with enhanced settings
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-quart',
            delay: 100
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NSCoatingApp;
}
