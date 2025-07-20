/**
 * Chat Widget v2 - Cart Module
 * Shopping cart and checkout functionality
 */

class CartManager {
    constructor(widget) {
        this.widget = widget;
        this.checkoutSteps = ['cart', 'shipping', 'payment', 'confirmation'];
        this.currentStep = 0;
        
        // Initialize cart from storage
        this.loadCart();
    }
    
    /**
     * Load cart from local storage
     */
    loadCart() {
        const savedCart = WidgetUtils.storage.get('cart');
        if (savedCart) {
            this.widget.state.cart = savedCart;
            this.updateCartBadge();
        }
    }
    
    /**
     * Save cart to local storage
     */
    saveCart() {
        WidgetUtils.storage.set('cart', this.widget.state.cart);
    }
    
    /**
     * Add item to cart
     */
    addToCart(product, colorIndex = 0) {
        const cartItem = {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            color: product.colors[colorIndex],
            colorIndex: colorIndex,
            quantity: 1
        };
        
        // Check if item already exists
        const existingItemIndex = this.widget.state.cart.findIndex(
            item => item.id === cartItem.id && item.colorIndex === cartItem.colorIndex
        );
        
        if (existingItemIndex >= 0) {
            this.widget.state.cart[existingItemIndex].quantity++;
        } else {
            this.widget.state.cart.push(cartItem);
        }
        
        this.updateCartBadge();
        this.saveCart();
        this.showCartNotification(product);
        
        // Show cart button in viewport
        const cartButton = document.getElementById('cartButton');
        if (cartButton) {
            cartButton.style.display = 'flex';
            WidgetUtils.animation.bounce(cartButton);
        }
    }
    
    /**
     * Remove item from cart
     */
    removeFromCart(itemId, colorIndex) {
        const index = this.widget.state.cart.findIndex(
            item => item.id === itemId && item.colorIndex === colorIndex
        );
        
        if (index >= 0) {
            this.widget.state.cart.splice(index, 1);
            this.updateCartBadge();
            this.saveCart();
            
            // Re-render cart if visible
            if (this.currentStep === 0) {
                this.renderCartView();
            }
        }
    }
    
    /**
     * Update item quantity
     */
    updateQuantity(itemId, colorIndex, change) {
        const item = this.widget.state.cart.find(
            item => item.id === itemId && item.colorIndex === colorIndex
        );
        
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            this.updateCartBadge();
            this.saveCart();
            
            // Update UI
            if (this.currentStep === 0) {
                this.updateCartTotals();
                const quantityEl = document.querySelector(
                    `[data-item-id="${itemId}"][data-color-index="${colorIndex}"] .quantity-value`
                );
                if (quantityEl) {
                    quantityEl.textContent = item.quantity;
                }
            }
        }
    }
    
    /**
     * Update cart badge
     */
    updateCartBadge() {
        const totalItems = this.widget.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }
    
    /**
     * Show cart notification
     */
    showCartNotification(product) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification fade-in';
        notification.innerHTML = `
            <div class="notification-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="notification-icon">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
                <span>${product.name} added to cart</span>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .cart-notification {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 12px 20px;
                box-shadow: var(--shadow-large);
                z-index: 10001;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-icon {
                width: 20px;
                height: 20px;
                color: var(--success-color);
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            WidgetUtils.animation.fadeOut(notification);
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Show cart overlay
     */
    showCart() {
        this.currentStep = 0;
        this.renderCartView();
        const overlay = document.getElementById('overlayContainer');
        overlay.classList.add('visible');
        
        // Track state for proper back navigation
        this.widget.state.previousView = this.widget.state.currentView;
        this.widget.state.currentView = 'cart';
    }
    
    /**
     * Hide overlay
     */
    hideOverlay() {
        const overlay = document.getElementById('overlayContainer');
        overlay.classList.remove('visible');
        
        // Restore previous view state
        this.widget.state.currentView = this.widget.state.previousView || 'results';
    }
    
    /**
     * Render cart view
     */
    renderCartView() {
        const overlay = document.getElementById('overlayContainer');
        const subtotal = WidgetUtils.pricing.calculateSubtotal(this.widget.state.cart);
        const delivery = subtotal >= WidgetUtils.pricing.getFreeShippingThreshold() ? 0 : 50;
        const total = WidgetUtils.pricing.calculateTotal(subtotal, delivery);
        
        const html = `
            <div class="overlay-header">
                <button class="back-btn" onclick="window.chatWidget.cart.hideOverlay()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h2 class="overlay-title">Cart List</h2>
            </div>
            <div class="overlay-content">
                ${this.widget.state.cart.length === 0 ? this.renderEmptyCart() : this.renderCartItems()}
            </div>
            ${this.widget.state.cart.length > 0 ? this.renderCartSummary(subtotal, delivery, total) : ''}
        `;
        
        overlay.innerHTML = html;
        
        // Bind quantity controls
        this.bindQuantityControls();
    }
    
    /**
     * Render empty cart
     */
    renderEmptyCart() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 2 L9 6 L6 6 L4 20 L20 20 L18 6 L15 6 L15 2 Z"></path>
                    </svg>
                </div>
                <h3 class="empty-title">Your cart is empty</h3>
                <p class="empty-subtitle">Add some products to get started</p>
            </div>
        `;
    }
    
    /**
     * Render cart items
     */
    renderCartItems() {
        return `
            <div class="cart-items">
                ${this.widget.state.cart.map(item => this.renderCartItem(item)).join('')}
            </div>
        `;
    }
    
    /**
     * Render single cart item
     */
    renderCartItem(item) {
        return `
            <div class="cart-item" data-item-id="${item.id}" data-color-index="${item.colorIndex}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-brand">${item.brand}</p>
                    <div class="cart-item-color">
                        <span class="color-dot" style="background: ${item.color}"></span>
                        <span>Color</span>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <p class="cart-item-price">${WidgetUtils.pricing.formatPrice(item.price * item.quantity)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-action="decrease">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus" data-action="increase">+</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render cart summary
     */
    renderCartSummary(subtotal, delivery, total) {
        const freeShippingThreshold = WidgetUtils.pricing.getFreeShippingThreshold();
        const needsForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
        
        return `
            <div class="cart-summary">
                ${needsForFreeShipping > 0 ? `
                    <div class="free-shipping-notice">
                        Add ${WidgetUtils.pricing.formatPrice(needsForFreeShipping)} more for free shipping!
                    </div>
                ` : ''}
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${WidgetUtils.pricing.formatPrice(subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Delivery</span>
                    <span>${delivery === 0 ? 'FREE' : WidgetUtils.pricing.formatPrice(delivery)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${WidgetUtils.pricing.formatPrice(total)}</span>
                </div>
                <button class="continue-btn" onclick="window.chatWidget.cart.proceedToShipping()">
                    Continue
                </button>
            </div>
        `;
    }
    
    /**
     * Bind quantity controls
     */
    bindQuantityControls() {
        const overlay = document.getElementById('overlayContainer');
        
        overlay.addEventListener('click', (e) => {
            const btn = e.target.closest('.quantity-btn');
            if (btn) {
                const cartItem = btn.closest('.cart-item');
                const itemId = cartItem.dataset.itemId;
                const colorIndex = parseInt(cartItem.dataset.colorIndex);
                const action = btn.dataset.action;
                
                const change = action === 'increase' ? 1 : -1;
                this.updateQuantity(itemId, colorIndex, change);
            }
        });
    }
    
    /**
     * Update cart totals
     */
    updateCartTotals() {
        const subtotal = WidgetUtils.pricing.calculateSubtotal(this.widget.state.cart);
        const delivery = subtotal >= WidgetUtils.pricing.getFreeShippingThreshold() ? 0 : 50;
        const total = WidgetUtils.pricing.calculateTotal(subtotal, delivery);
        
        // Update summary if visible
        const summaryEl = document.querySelector('.cart-summary');
        if (summaryEl) {
            const newSummary = this.renderCartSummary(subtotal, delivery, total);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newSummary;
            summaryEl.replaceWith(tempDiv.firstElementChild);
        }
    }
    
    /**
     * Proceed to shipping
     */
    proceedToShipping() {
        this.currentStep = 1;
        this.renderShippingForm();
    }
    
    /**
     * Render shipping form
     */
    renderShippingForm() {
        const overlay = document.getElementById('overlayContainer');
        
        const html = `
            <div class="overlay-header">
                <button class="back-btn" onclick="window.chatWidget.cart.goBack()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h2 class="overlay-title">Checkout</h2>
            </div>
            <div class="overlay-content">
                ${this.renderCheckoutProgress()}
                <form id="shippingForm" onsubmit="window.chatWidget.cart.handleShippingSubmit(event)">
                    <div class="form-group">
                        <label class="form-label" for="fullName">Full Name*</label>
                        <input type="text" id="fullName" name="fullName" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="email">Email Address*</label>
                        <input type="email" id="email" name="email" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="phone">Phone Number*</label>
                        <input type="tel" id="phone" name="phone" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="address">Street Address*</label>
                        <input type="text" id="address" name="address" class="form-input" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="city">City*</label>
                            <input type="text" id="city" name="city" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="postalCode">Postal Code*</label>
                            <input type="text" id="postalCode" name="postalCode" class="form-input" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="country">Country</label>
                        <select id="country" name="country" class="form-select">
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="cart-summary">
                <button type="submit" form="shippingForm" class="continue-btn">
                    Continue to Payment
                </button>
            </div>
        `;
        
        overlay.innerHTML = html;
    }
    
    /**
     * Render checkout progress
     */
    renderCheckoutProgress() {
        const steps = [
            { icon: '📦', label: 'Shipping' },
            { icon: '💳', label: 'Payment' },
            { icon: '✓', label: 'Review' }
        ];
        
        return `
            <div class="checkout-progress">
                ${steps.map((step, index) => `
                    <div class="progress-step ${index < this.currentStep ? 'completed' : ''} ${index === this.currentStep - 1 ? 'active' : ''}">
                        <div class="progress-icon">${step.icon}</div>
                        <span class="progress-label">${step.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Handle shipping form submit
     */
    handleShippingSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const validation = WidgetUtils.validation.validateForm(form);
        
        if (!validation.isValid) {
            WidgetUtils.validation.showErrors(form, validation.errors);
            return;
        }
        
        // Save shipping data
        const formData = new FormData(form);
        this.widget.state.shippingData = Object.fromEntries(formData);
        
        // Proceed to payment
        this.currentStep = 2;
        this.renderPaymentForm();
    }
    
    /**
     * Render payment form
     */
    renderPaymentForm() {
        const overlay = document.getElementById('overlayContainer');
        
        const html = `
            <div class="overlay-header">
                <button class="back-btn" onclick="window.chatWidget.cart.goBack()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <h2 class="overlay-title">Payment</h2>
            </div>
            <div class="overlay-content">
                ${this.renderCheckoutProgress()}
                <form id="paymentForm" onsubmit="window.chatWidget.cart.handlePaymentSubmit(event)">
                    <div class="payment-methods">
                        <div class="payment-method">
                            <input type="radio" id="creditCard" name="paymentMethod" value="card" checked>
                            <label for="creditCard" class="payment-method-label">
                                <div class="payment-method-icon">💳</div>
                                <span class="payment-method-text">Credit Card</span>
                            </label>
                        </div>
                        <div class="payment-method">
                            <input type="radio" id="paypal" name="paymentMethod" value="paypal">
                            <label for="paypal" class="payment-method-label">
                                <div class="payment-method-icon">🅿️</div>
                                <span class="payment-method-text">PayPal</span>
                            </label>
                        </div>
                    </div>
                    
                    <div id="cardFields">
                        <div class="form-group">
                            <label class="form-label" for="cardNumber">Card Number</label>
                            <input type="text" id="cardNumber" name="cardNumber" class="form-input" 
                                   placeholder="1234 5678 9012 3456" maxlength="19" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="expiryDate">Expiry Date</label>
                                <input type="text" id="expiryDate" name="expiryDate" class="form-input" 
                                       placeholder="MM/YY" maxlength="5" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="cvv">CVV</label>
                                <input type="text" id="cvv" name="cvv" class="form-input" 
                                       placeholder="123" maxlength="4" required>
                            </div>
                        </div>
                    </div>
                    
                    <div id="paypalMessage" style="display: none;" class="text-center mt-3">
                        <p>You will be redirected to PayPal to complete your payment.</p>
                    </div>
                </form>
            </div>
            <div class="cart-summary">
                <button type="submit" form="paymentForm" class="continue-btn">
                    Complete Order
                </button>
            </div>
        `;
        
        overlay.innerHTML = html;
        
        // Add payment method switching
        this.bindPaymentMethodSwitching();
        
        // Add input formatting
        this.bindPaymentInputFormatting();
    }
    
    /**
     * Bind payment method switching
     */
    bindPaymentMethodSwitching() {
        const form = document.getElementById('paymentForm');
        const cardFields = document.getElementById('cardFields');
        const paypalMessage = document.getElementById('paypalMessage');
        
        form.addEventListener('change', (e) => {
            if (e.target.name === 'paymentMethod') {
                if (e.target.value === 'card') {
                    cardFields.style.display = 'block';
                    paypalMessage.style.display = 'none';
                    cardFields.querySelectorAll('input').forEach(input => {
                        input.required = true;
                    });
                } else {
                    cardFields.style.display = 'none';
                    paypalMessage.style.display = 'block';
                    cardFields.querySelectorAll('input').forEach(input => {
                        input.required = false;
                    });
                }
            }
        });
    }
    
    /**
     * Bind payment input formatting
     */
    bindPaymentInputFormatting() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                e.target.value = WidgetUtils.formatCardNumber(e.target.value);
            });
        }
        
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                e.target.value = WidgetUtils.formatExpiryDate(e.target.value);
            });
        }
    }
    
    /**
     * Handle payment form submit
     */
    handlePaymentSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const paymentMethod = formData.get('paymentMethod');
        
        if (paymentMethod === 'card') {
            const validation = WidgetUtils.validation.validateForm(form);
            if (!validation.isValid) {
                WidgetUtils.validation.showErrors(form, validation.errors);
                return;
            }
        }
        
        // Save payment data (in real app, this would be tokenized)
        this.widget.state.paymentData = {
            method: paymentMethod,
            // Don't save actual card details in production!
        };
        
        // Show loading
        this.showProcessingOrder();
        
        // Simulate order processing
        setTimeout(() => {
            this.completeOrder();
        }, 2000);
    }
    
    /**
     * Show processing order
     */
    showProcessingOrder() {
        const overlay = document.getElementById('overlayContainer');
        
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="loading">
                    <div class="loading-spinner"></div>
                </div>
                <h3 class="text-center mt-3">Processing your order...</h3>
            </div>
        `;
    }
    
    /**
     * Complete order
     */
    completeOrder() {
        // Generate order number
        const orderNumber = WidgetUtils.generateOrderNumber();
        this.widget.state.orderNumber = orderNumber;
        
        // Clear cart
        this.widget.state.cart = [];
        this.updateCartBadge();
        this.saveCart();
        
        // Show confirmation
        this.renderOrderConfirmation();
    }
    
    /**
     * Render order confirmation
     */
    renderOrderConfirmation() {
        const overlay = document.getElementById('overlayContainer');
        
        const html = `
            <div class="overlay-content">
                <div class="confirmation-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                </div>
                <h2 class="confirmation-title">Order Confirmed!</h2>
                <p class="confirmation-subtitle">Thank you for your purchase</p>
                
                <div class="order-details">
                    <div class="order-detail-row">
                        <span class="order-detail-label">Order Number</span>
                        <span class="order-detail-value">${this.widget.state.orderNumber}</span>
                    </div>
                    <div class="order-detail-row">
                        <span class="order-detail-label">Delivery Address</span>
                        <span class="order-detail-value">${this.widget.state.shippingData.address}, ${this.widget.state.shippingData.city}</span>
                    </div>
                    <div class="order-detail-row">
                        <span class="order-detail-label">Estimated Delivery</span>
                        <span class="order-detail-value">3-5 business days</span>
                    </div>
                </div>
                
                <button class="continue-btn" onclick="window.chatWidget.cart.closeAndReset()">
                    Continue Shopping
                </button>
            </div>
        `;
        
        overlay.innerHTML = html;
    }
    
    /**
     * Go back in checkout flow
     */
    goBack() {
        if (this.currentStep > 0) {
            this.currentStep--;
            
            switch (this.currentStep) {
                case 0:
                    this.renderCartView();
                    break;
                case 1:
                    this.renderShippingForm();
                    break;
                case 2:
                    this.renderPaymentForm();
                    break;
            }
        }
    }
    
    /**
     * Close and reset
     */
    closeAndReset() {
        this.hideOverlay();
        this.currentStep = 0;
        
        // Reset widget state
        this.widget.state = {
            ...this.widget.state,
            shippingData: null,
            paymentData: null,
            orderNumber: null
        };
        
        // Collapse widget
        this.widget.collapse();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}