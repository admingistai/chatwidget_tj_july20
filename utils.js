/**
 * Chat Widget v2 - Utility Functions
 * Helper functions for the chat widget
 */

const WidgetUtils = {
    /**
     * Local Storage Helpers
     */
    storage: {
        get(key) {
            try {
                const item = localStorage.getItem(`widget-${key}`);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Storage get error:', e);
                return null;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(`widget-${key}`, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(`widget-${key}`);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        }
    },
    
    /**
     * Animation Utilities
     */
    animation: {
        fadeIn(element, duration = 300) {
            element.style.opacity = '0';
            element.style.display = 'block';
            element.classList.add('fade-in');
            
            setTimeout(() => {
                element.style.opacity = '1';
            }, 10);
            
            setTimeout(() => {
                element.classList.remove('fade-in');
            }, duration);
        },
        
        fadeOut(element, duration = 300) {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
            }, duration);
        },
        
        slideUp(element, duration = 300) {
            element.style.transform = 'translateY(100%)';
            element.style.display = 'block';
            element.classList.add('slide-up');
            
            setTimeout(() => {
                element.style.transform = 'translateY(0)';
            }, 10);
            
            setTimeout(() => {
                element.classList.remove('slide-up');
            }, duration);
        },
        
        bounce(element) {
            element.classList.add('bounce');
            setTimeout(() => {
                element.classList.remove('bounce');
            }, 500);
        }
    },
    
    /**
     * Form Validation
     */
    validation: {
        isEmail(email) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(email);
        },
        
        isPhone(phone) {
            const cleaned = phone.replace(/\D/g, '');
            return cleaned.length >= 10;
        },
        
        isPostalCode(code) {
            // Basic validation - can be customized per country
            return code.length >= 4;
        },
        
        isCreditCard(number) {
            const cleaned = number.replace(/\s/g, '');
            return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
        },
        
        isExpiryDate(date) {
            const pattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!pattern.test(date)) return false;
            
            const [month, year] = date.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const now = new Date();
            
            return expiry > now;
        },
        
        isCVV(cvv) {
            return /^\d{3,4}$/.test(cvv);
        },
        
        validateForm(formElement) {
            const errors = {};
            const inputs = formElement.querySelectorAll('input[required], select[required]');
            
            inputs.forEach(input => {
                const value = input.value.trim();
                const name = input.name;
                
                if (!value) {
                    errors[name] = 'This field is required';
                    return;
                }
                
                // Specific validations
                switch (input.type) {
                    case 'email':
                        if (!this.isEmail(value)) {
                            errors[name] = 'Please enter a valid email';
                        }
                        break;
                    case 'tel':
                        if (!this.isPhone(value)) {
                            errors[name] = 'Please enter a valid phone number';
                        }
                        break;
                }
                
                // Credit card specific validations
                if (name === 'cardNumber' && !this.isCreditCard(value)) {
                    errors[name] = 'Please enter a valid card number';
                }
                if (name === 'expiryDate' && !this.isExpiryDate(value)) {
                    errors[name] = 'Please enter a valid expiry date (MM/YY)';
                }
                if (name === 'cvv' && !this.isCVV(value)) {
                    errors[name] = 'Please enter a valid CVV';
                }
            });
            
            return {
                isValid: Object.keys(errors).length === 0,
                errors
            };
        },
        
        showErrors(formElement, errors) {
            // Clear previous errors
            formElement.querySelectorAll('.form-error').forEach(el => el.remove());
            formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            
            // Show new errors
            Object.entries(errors).forEach(([fieldName, message]) => {
                const field = formElement.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    field.classList.add('error');
                    const errorEl = document.createElement('div');
                    errorEl.className = 'form-error';
                    errorEl.textContent = message;
                    field.parentElement.appendChild(errorEl);
                }
            });
        }
    },
    
    /**
     * Price Calculations
     */
    pricing: {
        formatPrice(price) {
            return `$${parseFloat(price).toFixed(2)}`;
        },
        
        calculateSubtotal(items) {
            return items.reduce((sum, item) => {
                // Handle both string prices (with $) and numeric prices
                const price = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace('$', ''))
                    : item.price;
                return sum + (price * item.quantity);
            }, 0);
        },
        
        calculateTotal(subtotal, delivery = 50) {
            return subtotal + delivery;
        },
        
        getFreeShippingThreshold() {
            return 100; // Free shipping over $100
        },
        
        shouldShowFreeShipping(subtotal) {
            return subtotal < this.getFreeShippingThreshold();
        }
    },
    
    /**
     * Debounce Function
     */
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
    },
    
    /**
     * Throttle Function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Generate Unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Format Credit Card Number
     */
    formatCardNumber(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    },
    
    /**
     * Format Expiry Date
     */
    formatExpiryDate(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
        }
        return v;
    },
    
    /**
     * Smooth Scroll
     */
    smoothScroll(element, target, duration = 300) {
        const start = element.scrollLeft;
        const change = target - start;
        const startTime = performance.now();
        
        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.scrollLeft = start + change * easeInOutCubic(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        }
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        
        requestAnimationFrame(animateScroll);
    },
    
    /**
     * Copy to Clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },
    
    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    /**
     * Get scroll percentage
     */
    getScrollPercentage(element) {
        const scrollLeft = element.scrollLeft;
        const scrollWidth = element.scrollWidth - element.clientWidth;
        return scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
    },
    
    /**
     * Format date
     */
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('en-US', options);
    },
    
    /**
     * Generate order number
     */
    generateOrderNumber() {
        const prefix = 'ORD';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetUtils;
}