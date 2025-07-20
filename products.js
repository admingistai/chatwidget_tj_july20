/**
 * Chat Widget v2 - Products Module
 * Product catalog and carousel functionality
 */

const ProductCatalog = {
    // Marques Brownlee Collection
    marquesProducts: [
        {
            id: 'mb-001',
            name: 'Tech Runner Pro',
            brand: 'MKBHD x VERTEX',
            price: 149.99,
            image: '/images/products/apex-runner.jpg',
            colors: ['#FF0000', '#000000', '#FFFFFF', '#808080'],
            description: 'High-performance running shoes designed for tech enthusiasts'
        },
        {
            id: 'mb-002',
            name: 'Studio Walker',
            brand: 'MKBHD x VERTEX',
            price: 129.99,
            image: '/images/products/urban-forge.jpg',
            colors: ['#1E1E1E', '#FF6B6B', '#4ECDC4', '#FFE66D'],
            description: 'Comfortable all-day wear for content creators'
        },
        {
            id: 'mb-003',
            name: 'Crispy Casual',
            brand: 'MKBHD x VERTEX',
            price: 99.99,
            image: '/images/products/sky-dancer.jpg',
            colors: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5'],
            description: 'Stylish casual sneakers with premium materials'
        },
        {
            id: 'mb-004',
            name: 'Matte Black Edition',
            brand: 'MKBHD Special',
            price: 199.99,
            image: '/images/products/storm-shield.jpg',
            colors: ['#000000', '#1A1A1A', '#2D2D2D', '#FF0000'],
            description: 'Limited edition all-black premium sneakers'
        }
    ],
    
    // Hiking Collection
    hikingProducts: [
        {
            id: 'hk-001',
            name: 'Summit Pro',
            brand: 'VERTEX',
            price: 189.99,
            image: '/images/products/summit-pro.jpg',
            colors: ['#8B4513', '#556B2F', '#708090', '#000000'],
            description: 'Professional grade hiking boots for serious adventurers'
        },
        {
            id: 'hk-002',
            name: 'Terra Guide',
            brand: 'VERTEX',
            price: 159.99,
            image: '/images/products/terra-guide.jpg',
            colors: ['#D2691E', '#228B22', '#4682B4', '#8B0000'],
            description: 'All-terrain hiking shoes with superior grip'
        },
        {
            id: 'hk-003',
            name: 'Storm Shield',
            brand: 'VERTEX',
            price: 179.99,
            image: '/images/products/storm-shield.jpg',
            colors: ['#2F4F4F', '#FF8C00', '#4169E1', '#696969'],
            description: 'Waterproof hiking boots for extreme weather'
        }
    ],
    
    // General Products
    generalProducts: [
        {
            id: 'gn-001',
            name: 'Urban Runner',
            brand: 'VERTEX',
            price: 89.99,
            image: '/images/products/sport.jpg',
            colors: ['#FF69B4', '#00CED1', '#FFD700', '#9370DB'],
            description: 'Lightweight running shoes for city streets'
        },
        {
            id: 'gn-002',
            name: 'Classic Walker',
            brand: 'VERTEX',
            price: 79.99,
            image: '/images/products/luna-rise.jpg',
            colors: ['#F0E68C', '#DDA0DD', '#98FB98', '#F4A460'],
            description: 'Comfortable walking shoes for everyday wear'
        }
    ],
    
    /**
     * Search products by query
     */
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        let results = [];
        
        // Check for special triggers
        if (lowerQuery.includes('marques') || lowerQuery.includes('mkbhd') || lowerQuery.includes('brownlee')) {
            return this.marquesProducts;
        }
        
        if (lowerQuery.includes('hiking') || lowerQuery.includes('outdoor') || lowerQuery.includes('trail')) {
            return this.hikingProducts;
        }
        
        // General search across all products
        const allProducts = [...this.marquesProducts, ...this.hikingProducts, ...this.generalProducts];
        
        results = allProducts.filter(product => {
            return product.name.toLowerCase().includes(lowerQuery) ||
                   product.brand.toLowerCase().includes(lowerQuery) ||
                   product.description.toLowerCase().includes(lowerQuery);
        });
        
        // If no results, return some general products
        if (results.length === 0) {
            results = this.generalProducts.slice(0, 3);
        }
        
        return results;
    },
    
    /**
     * Get product by ID
     */
    getProductById(id) {
        const allProducts = [...this.marquesProducts, ...this.hikingProducts, ...this.generalProducts];
        return allProducts.find(product => product.id === id);
    },
    
    /**
     * Build product carousel HTML
     */
    buildCarousel(products, carouselId = 'productCarousel') {
        return `
            <div class="product-carousel" id="${carouselId}">
                <div class="carousel-container">
                    <div class="carousel-track" id="${carouselId}Track">
                        ${products.map((product, index) => this.buildProductCard(product, index)).join('')}
                    </div>
                </div>
                <div class="carousel-nav">
                    <button class="carousel-btn prev" id="${carouselId}Prev" disabled aria-label="Previous product">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button class="carousel-btn next" id="${carouselId}Next" aria-label="Next product">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },
    
    /**
     * Build individual product card
     */
    buildProductCard(product, index = 0) {
        const selectedColorIndex = 0; // Default to first color
        
        return `
            <div class="product-card" data-product-id="${product.id}" data-index="${index}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <p class="product-price">${WidgetUtils.pricing.formatPrice(product.price)}</p>
                </div>
                <button class="add-to-cart-btn" data-product-id="${product.id}" data-color-index="${selectedColorIndex}">
                    Add to Cart
                </button>
                <div class="color-swatches">
                    ${product.colors.map((color, i) => `
                        <span class="color-swatch ${i === selectedColorIndex ? 'active' : ''}" 
                              style="background: ${color}"
                              data-color-index="${i}"
                              data-product-id="${product.id}"
                              aria-label="Color option ${i + 1}"></span>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * Initialize carousel functionality
     */
    initializeCarousel(carouselId, widget) {
        const track = document.getElementById(`${carouselId}Track`);
        const prevBtn = document.getElementById(`${carouselId}Prev`);
        const nextBtn = document.getElementById(`${carouselId}Next`);
        
        if (!track || !prevBtn || !nextBtn) return;
        
        let currentIndex = 0;
        const cards = track.querySelectorAll('.product-card');
        const cardCount = cards.length;
        
        // Update button states
        const updateButtons = () => {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === cardCount - 1;
        };
        
        // Scroll to card
        const scrollToCard = (index) => {
            const card = cards[index];
            if (card) {
                const cardRect = card.getBoundingClientRect();
                const trackRect = track.getBoundingClientRect();
                const offset = cardRect.left - trackRect.left - (trackRect.width - cardRect.width) / 2;
                
                WidgetUtils.smoothScroll(track, track.scrollLeft + offset);
                currentIndex = index;
                updateButtons();
            }
        };
        
        // Navigation buttons
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                scrollToCard(currentIndex - 1);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < cardCount - 1) {
                scrollToCard(currentIndex + 1);
            }
        });
        
        // Scroll event to update current index
        let scrollTimeout;
        track.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const center = track.scrollLeft + track.clientWidth / 2;
                let newIndex = 0;
                let minDistance = Infinity;
                
                cards.forEach((card, index) => {
                    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                    const distance = Math.abs(center - cardCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        newIndex = index;
                    }
                });
                
                if (newIndex !== currentIndex) {
                    currentIndex = newIndex;
                    updateButtons();
                }
            }, 100);
        });
        
        // Touch/swipe support
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;
        
        track.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.style.cursor = 'grabbing';
        });
        
        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });
        
        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });
        
        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });
        
        // Touch events for mobile
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });
        
        track.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });
        
        // Color swatch selection
        track.addEventListener('click', (e) => {
            const swatch = e.target.closest('.color-swatch');
            if (swatch) {
                const productId = swatch.dataset.productId;
                const colorIndex = parseInt(swatch.dataset.colorIndex);
                const card = swatch.closest('.product-card');
                
                // Update active swatch
                card.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                
                // Update add to cart button data
                const addBtn = card.querySelector('.add-to-cart-btn');
                if (addBtn) {
                    addBtn.dataset.colorIndex = colorIndex;
                }
            }
            
            // Add to cart button
            const addBtn = e.target.closest('.add-to-cart-btn');
            if (addBtn) {
                const productId = addBtn.dataset.productId;
                const colorIndex = parseInt(addBtn.dataset.colorIndex || 0);
                const product = this.getProductById(productId);
                
                if (product && widget && widget.cart) {
                    widget.cart.addToCart(product, colorIndex);
                    WidgetUtils.animation.bounce(addBtn);
                }
            }
        });
        
        // Initial button state
        updateButtons();
    },
    
    /**
     * Build search results HTML
     */
    buildSearchResults(query, results) {
        if (results.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </div>
                    <h3 class="empty-title">No results found</h3>
                    <p class="empty-subtitle">Try searching for "hiking", "running", or "Marques Brownlee"</p>
                </div>
            `;
        }
        
        return `
            <div class="search-results">
                <p class="results-summary">Found ${results.length} products for "${query}"</p>
                ${this.buildCarousel(results, 'searchResultsCarousel')}
            </div>
        `;
    },
    
    /**
     * Get suggested questions
     */
    getSuggestions() {
        return [
            "Show me hiking boots",
            "Marques Brownlee collection",
            "Best running shoes",
            "Waterproof outdoor gear",
            "New arrivals",
            "Under $100",
            "Premium collection",
            "Tech-inspired designs"
        ];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductCatalog;
}