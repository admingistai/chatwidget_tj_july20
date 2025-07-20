/**
 * Chat Widget v2 - Main Controller
 * Handles widget initialization, state management, and core interactions
 */

class ChatWidgetV2 {
    constructor() {
        // State management
        this.state = {
            isExpanded: false,
            currentView: 'input', // input, results, cart
            theme: 'light',
            cart: [],
            searchQuery: '',
            shippingData: null,
            paymentData: null,
            orderNumber: null,
            previousView: null,
            messages: [],        // Store all messages/searches
            currentIndex: 0      // Current message index
        };

       
        
        
        // DOM references
        this.elements = {};
        
        // Cart manager
        this.cart = null;
        
        // Progress bar interaction state
        this.isDragging = false;
        this.trackRect = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize widget
     */
    async init() {
        // Load widget HTML
        await this.loadWidgetHTML();
        
        // Cache DOM elements
        this.cacheDOMElements();
        
        // Initialize cart manager
        this.cart = new CartManager(this);
        
        // Bind events
        this.bindEvents();
        
        // Setup progress bar interaction
        this.setupProgressBarInteraction();
        
        // Load saved state
        this.loadSavedState();
        
        // Setup suggestions
        this.setupSuggestions();
        
        // Initialize theme
        this.initializeTheme();
        
        // Make widget accessible globally
        window.chatWidget = this;
    }
    
    /**
     * Load widget HTML into page
     */
    async loadWidgetHTML() {
        try {
            const response = await fetch('/chat-widget-v2/index.html');
            const html = await response.text();
            
            // Create container and append to body
            const container = document.createElement('div');
            container.innerHTML = html;
            document.body.appendChild(container.firstElementChild);
        } catch (error) {
            console.error('Failed to load widget HTML:', error);
        }
    }
    
    /**
     * Cache DOM elements
     */
    cacheDOMElements() {
        this.elements = {
            widget: document.getElementById('chatWidgetV2'),
            inputContainer: document.getElementById('inputContainer'),
            chatInput: document.getElementById('chatInput'),
            actionButtons: document.getElementById('actionButtons'),
            themeToggle: document.getElementById('themeToggle'),
            micButton: document.getElementById('micButton'),
            suggestionContainer: document.getElementById('suggestionContainer'),
            suggestionTrack: document.getElementById('suggestionTrack'),
            viewport: document.getElementById('viewport'),
            queryText: document.getElementById('queryText'),
            viewportContent: document.getElementById('viewportContent'),
            cartButton: document.getElementById('cartButton'),
            cartBadge: document.getElementById('cartBadge'),
            floatingProgressBar: document.getElementById('floatingProgressBar'),
            progressThumb: document.getElementById('progressThumb'),
            progressTrack: document.getElementById('progressTrack'),
            progressFill: document.getElementById('progressFill'),
            overlayContainer: document.getElementById('overlayContainer')
        };
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Input container click to expand
        this.elements.inputContainer.addEventListener('click', (e) => {
            if (!this.state.isExpanded && 
                (e.target === this.elements.inputContainer || e.target === this.elements.chatInput)) {
                this.expand();
            }
        });
        
        // Input focus
        this.elements.chatInput.addEventListener('focus', () => {
            if (!this.state.isExpanded) {
                this.expand();
            }
        });
        
        // Search on Enter
        this.elements.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.elements.chatInput.value.trim()) {
                this.handleSearch();
            }
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTheme();
        });
        
        // Mic button (placeholder)
        this.elements.micButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleVoiceInput();
        });
        
        // Cart button
        if (this.elements.cartButton) {
            this.elements.cartButton.addEventListener('click', () => {
                this.cart.showCart();
            });
        }
        
        // Click outside to collapse
        document.addEventListener('click', (e) => {
            if (!this.elements.widget.contains(e.target) && 
                this.state.isExpanded && 
                this.state.currentView === 'input') {
                this.collapse();
            }
        });
        
        // Suggestion clicks
        this.elements.suggestionTrack.addEventListener('click', (e) => {
            const pill = e.target.closest('.suggestion-pill');
            if (pill) {
                this.elements.chatInput.value = pill.textContent;
                this.handleSearch();
            }
        });
        
        // Escape key to collapse
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isExpanded) {
                this.collapse();
            }
        });
    }
    
    /**
     * Load saved state
     */
    loadSavedState() {
        // Load theme
        const savedTheme = WidgetUtils.storage.get('theme');
        if (savedTheme) {
            this.state.theme = savedTheme;
            this.applyTheme();
        }
        
        // Cart is loaded by CartManager
    }
    
    /**
     * Setup suggestions
     */
    setupSuggestions() {
        const suggestions = ProductCatalog.getSuggestions();
        const html = suggestions.map(text => 
            `<button class="suggestion-pill">${text}</button>`
        ).join('');
        
        this.elements.suggestionTrack.innerHTML = html;
    }
    
    /**
     * Initialize theme
     */
    initializeTheme() {
        // Check for saved theme or system preference
        const savedTheme = WidgetUtils.storage.get('theme');
        if (savedTheme) {
            this.state.theme = savedTheme;
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.state.theme = prefersDark ? 'dark' : 'light';
        }
        
        this.applyTheme();
    }
    
    /**
     * Expand widget
     */
    expand() {
        this.state.isExpanded = true;
        this.elements.inputContainer.classList.remove('collapsed');
        this.elements.inputContainer.classList.add('expanded');
        
        // Show suggestions after animation
        setTimeout(() => {
            this.elements.suggestionContainer.classList.add('visible');
            this.elements.chatInput.focus();
        }, 150);
        
        // Dispatch event
        this.dispatchEvent('expand');
    }
    
    /**
     * Collapse widget
     */
    collapse() {
        this.state.isExpanded = false;
        this.state.currentView = 'input';
        
        this.elements.inputContainer.classList.remove('expanded');
        this.elements.inputContainer.classList.add('collapsed');
        this.elements.suggestionContainer.classList.remove('visible');
        this.elements.viewport.classList.remove('visible');
        this.elements.progressBar.classList.remove('visible');
        
        this.elements.chatInput.blur();
        this.elements.chatInput.value = '';
        
        // Dispatch event
        this.dispatchEvent('collapse');
    }
    
    /**
     * Handle search
     */
    handleSearch() {
        const query = this.elements.chatInput.value.trim();
        if (!query) return;
        
        this.state.searchQuery = query;
        this.state.currentView = 'results';
        
        // Hide suggestions
        this.elements.suggestionContainer.classList.remove('visible');
        
        // Show loading
        this.showLoading();
        
        // Simulate search delay
        setTimeout(() => {
            // Search products
            const results = ProductCatalog.searchProducts(query);
            
            // Show results
            this.showSearchResults(query, results);
            
            // Dispatch event
            this.dispatchEvent('search', { query, results });
        }, 800);
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        this.elements.viewport.classList.add('visible');
        this.elements.queryText.textContent = `Searching for "${this.state.searchQuery}"...`;
        this.elements.viewportContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
    }
    
    /**
     * Show search results
     */
    showSearchResults(query, results) {
        // Update header
        this.elements.queryText.textContent = query;
        
        // Check if it's a product-related query
        const lowerQuery = query.toLowerCase();
        
        // Check for Marques Brownlee queries
        const isMarquesQuery = lowerQuery.includes('marques') || 
                              lowerQuery.includes('mkbhd') || 
                              lowerQuery.includes('brownlee');
        
        // Check for hiking/shoe queries
        const isHikingQuery = lowerQuery.includes('hiking') || 
                             lowerQuery.includes('shoe') || 
                             lowerQuery.includes('boot') ||
                             lowerQuery.includes('sneaker');
        
        // Determine if this is a product query
        const isProductQuery = isMarquesQuery || isHikingQuery;
        
        // Save to message history
        const message = {
            id: WidgetUtils.generateId(),
            query: query,
            results: results,
            timestamp: Date.now(),
            type: isProductQuery ? 'product' : 'chat',
            isCarousel: isMarquesQuery  // Only Marques gets carousel
        };
        
        this.state.messages.push(message);
        this.state.currentIndex = this.state.messages.length - 1;
        
        // Update progress bar
        this.updateProgressBar();
        
        if (!isProductQuery) {
            // This is NOT a product query - send to ChatGPT
            console.log('Sending to ChatGPT:', query);
            this.sendToChatGPT(query);
        } else if (isMarquesQuery) {
            // Show carousel for Marques queries
            this.elements.viewportContent.innerHTML = ProductCatalog.buildCarousel(results, 'marquesCarousel');
            
            // Initialize carousel
            setTimeout(() => {
                ProductCatalog.initializeCarousel('marquesCarousel', this);
            }, 100);
            
            // Show cart button
            if (this.elements.cartButton) {
                this.elements.cartButton.style.display = 'flex';
            }
            
            // Dispatch event
            this.dispatchEvent('carousel-shown', { products: results });
        } else {
            // Show regular results for hiking/shoe queries
            this.elements.viewportContent.innerHTML = ProductCatalog.buildSearchResults(query, results);
            
            // Initialize carousel if results have products
            if (results.length > 0) {
                setTimeout(() => {
                    ProductCatalog.initializeCarousel('searchResultsCarousel', this);
                }, 100);
                
                // Show cart button
                if (this.elements.cartButton) {
                    this.elements.cartButton.style.display = 'flex';
                }
            }
        }
    }
    
    /**
     * Toggle theme
     */
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        WidgetUtils.storage.set('theme', this.state.theme);
        
        // Update icon
        this.updateThemeIcon();
        
        // Dispatch event
        this.dispatchEvent('theme-change', { theme: this.state.theme });
    }
    
    /**
     * Apply theme
     */
    applyTheme() {
        this.elements.widget.setAttribute('data-theme', this.state.theme);
        this.updateThemeIcon();
    }
    
    /**
     * Update theme icon
     */
    updateThemeIcon() {
        const isDark = this.state.theme === 'dark';
        const svg = this.elements.themeToggle.querySelector('svg');
        
        if (isDark) {
            // Moon icon
            svg.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"></path>
            `;
        } else {
            // Sun icon
            svg.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
        }
    }
    
    /**
     * Handle voice input (placeholder)
     */
    handleVoiceInput() {
        // Check if speech recognition is available
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input is not supported in your browser');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Update mic button to show listening state
        this.elements.micButton.classList.add('listening');
        
        recognition.start();
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.elements.chatInput.value = transcript;
            this.elements.micButton.classList.remove('listening');
            
            // Auto search after voice input
            setTimeout(() => {
                this.handleSearch();
            }, 500);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.elements.micButton.classList.remove('listening');
        };
        
        recognition.onend = () => {
            this.elements.micButton.classList.remove('listening');
        };
    }
    
    /**
     * Send query to ChatGPT
     */
    async sendToChatGPT(query) {
        try {
            // Show loading state
            this.elements.viewportContent.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 16px; color: var(--text-secondary);">Thinking...</p>
                </div>
            `;
            
            // Hide cart button for chat responses
            if (this.elements.cartButton) {
                this.elements.cartButton.style.display = 'none';
            }
            
            // Send request to your server with context
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    query: query,
                    context: {
                        cartItems: this.state.cart.length,
                        theme: this.state.theme,
                        previousSearches: this.state.messages.slice(-3).map(m => ({
                            query: m.query,
                            type: m.type
                        }))
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Display the ChatGPT response
            this.displayChatResponse(data.answer);
            
        } catch (error) {
            console.error('ChatGPT Error:', error);
            this.elements.viewportContent.innerHTML = `
                <div class="error-state">
                    <p>😕 Sorry, I couldn't get a response.</p>
                    <p style="font-size: 14px; margin-top: 8px;">Make sure the server is running on port 3000.</p>
                    <p style="font-size: 12px; margin-top: 8px; color: var(--text-tertiary);">Error: ${error.message}</p>
                </div>
            `;
        }
    }
    
    /**
     * Display ChatGPT response in the viewport
     */
    displayChatResponse(answer) {
        this.elements.viewportContent.innerHTML = `
            <div class="chat-response">
                <div class="response-content">
                    ${this.formatChatResponse(answer)}
                </div>
            </div>
        `;
    }
    
    /**
     * Format ChatGPT response with proper HTML
     */
    formatChatResponse(text) {
        // Split by double newlines for paragraphs
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        
        return paragraphs.map(paragraph => {
            // Check if it's a code block
            if (paragraph.startsWith('```')) {
                const code = paragraph.replace(/```/g, '').trim();
                return `<pre class="code-block"><code>${this.escapeHtml(code)}</code></pre>`;
            }
            
            // Check if it's a list (starts with - or * or numbers)
            if (paragraph.match(/^[\-\*\d]+\.\s/m)) {
                const items = paragraph.split('\n').filter(item => item.trim());
                
                // Check if it's numbered list
                if (paragraph.match(/^\d+\.\s/m)) {
                    return `<ol>${items.map(item => 
                        `<li>${this.escapeHtml(item.replace(/^\d+\.\s/, ''))}</li>`
                    ).join('')}</ol>`;
                } else {
                    // Bullet list
                    return `<ul>${items.map(item => 
                        `<li>${this.escapeHtml(item.replace(/^[\-\*]\s/, ''))}</li>`
                    ).join('')}</ul>`;
                }
            }
            
            // Regular paragraph
            return `<p>${this.escapeHtml(paragraph)}</p>`;
        }).join('');
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Setup progress bar interaction
     */
    setupProgressBarInteraction() {
        const thumb = this.elements.progressThumb;
        const track = this.elements.progressTrack;
        
        if (!thumb || !track) return;
        
        // Mouse events
        thumb.addEventListener('mousedown', (e) => this.startDrag(e));
        track.addEventListener('click', (e) => this.handleTrackClick(e));
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch events
        thumb.addEventListener('touchstart', (e) => this.startDragTouch(e), { passive: false });
        track.addEventListener('touchstart', (e) => this.handleTrackTouch(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleDragTouch(e), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());
    }
    
    /**
     * Start dragging (mouse)
     */
    startDrag(e) {
        this.isDragging = true;
        this.elements.progressThumb.classList.add('dragging');
        this.trackRect = this.elements.progressTrack.getBoundingClientRect();
        e.preventDefault();
    }
    
    /**
     * Start dragging (touch)
     */
    startDragTouch(e) {
        this.isDragging = true;
        this.elements.progressThumb.classList.add('dragging');
        this.trackRect = this.elements.progressTrack.getBoundingClientRect();
        e.preventDefault();
    }
    
    /**
     * Handle drag (mouse)
     */
    handleDrag(e) {
        if (!this.isDragging) return;
        this.updateThumbPosition(e.clientX);
    }
    
    /**
     * Handle drag (touch)
     */
    handleDragTouch(e) {
        if (!this.isDragging) return;
        this.updateThumbPosition(e.touches[0].clientX);
        e.preventDefault();
    }
    
    /**
     * Update thumb position
     */
    updateThumbPosition(clientX) {
        if (!this.trackRect) return;
        
        const x = clientX - this.trackRect.left;
        const percentage = Math.max(0, Math.min(100, (x / this.trackRect.width) * 100));
        
        // Snap to message positions
        const messageIndex = Math.round((percentage / 100) * (this.state.messages.length - 1));
        const snappedPercentage = this.state.messages.length <= 1 ? 0 : (messageIndex / (this.state.messages.length - 1)) * 100;
        
        // Update visuals immediately
        this.elements.progressThumb.style.left = `${snappedPercentage}%`;
        this.elements.progressFill.style.width = `${snappedPercentage}%`;
        
        // Navigate to message if index changed
        if (this.state.currentIndex !== messageIndex) {
            this.state.currentIndex = messageIndex;
            this.navigateToMessage(messageIndex);
        }
    }
    
    /**
     * End dragging
     */
    endDrag() {
        this.isDragging = false;
        if (this.elements.progressThumb) {
            this.elements.progressThumb.classList.remove('dragging');
        }
    }
    
    /**
     * Handle track click (mouse)
     */
    handleTrackClick(e) {
        if (this.isDragging) return;
        this.trackRect = this.elements.progressTrack.getBoundingClientRect();
        this.updateThumbPosition(e.clientX);
    }
    
    /**
     * Handle track click (touch)
     */
    handleTrackTouch(e) {
        if (this.isDragging) return;
        this.trackRect = this.elements.progressTrack.getBoundingClientRect();
        this.updateThumbPosition(e.touches[0].clientX);
        e.preventDefault();
    }
    
    /**
     * Update progress bar visual state
     */
    updateProgressBar() {
        if (this.state.messages.length <= 1) {
            this.elements.floatingProgressBar.classList.remove('show');
            return;
        }
        
        this.elements.floatingProgressBar.classList.add('show');
        const percentage = (this.state.currentIndex / (this.state.messages.length - 1)) * 100;
        this.elements.progressThumb.style.left = `${percentage}%`;
        this.elements.progressFill.style.width = `${percentage}%`;
    }
    
    /**
     * Navigate to a specific message
     */
    navigateToMessage(index) {
        const message = this.state.messages[index];
        if (message) {
            this.state.currentIndex = index;
            this.elements.chatInput.value = message.query;
            
            // Show the results for this message
            this.elements.viewport.classList.add('visible');
            this.elements.queryText.textContent = message.query;
            
            // Re-render the results
            if (message.isCarousel) {
                this.elements.viewportContent.innerHTML = ProductCatalog.buildCarousel(message.results, 'marquesCarousel');
                setTimeout(() => {
                    ProductCatalog.initializeCarousel('marquesCarousel', this);
                }, 100);
            } else {
                this.elements.viewportContent.innerHTML = ProductCatalog.buildSearchResults(message.query, message.results);
                if (message.results.length > 0) {
                    setTimeout(() => {
                        ProductCatalog.initializeCarousel('searchResultsCarousel', this);
                    }, 100);
                }
            }
            
            // Show cart button if needed
            if (this.elements.cartButton && message.results.length > 0) {
                this.elements.cartButton.style.display = 'flex';
            }
        }
    }
    
    /**
     * Dispatch custom events
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`widget-${eventName}`, { detail });
        document.dispatchEvent(event);
    }
}

// Initialize widget when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChatWidgetV2();
    });
} else {
    // DOM is already loaded
    new ChatWidgetV2();
}