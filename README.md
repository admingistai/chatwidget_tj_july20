# Chat Widget v2 with ChatGPT Integration

A modern, responsive chat widget for e-commerce websites with built-in ChatGPT integration and product carousel functionality.

![Chat Widget Demo](https://img.shields.io/badge/Status-Complete-brightgreen)
![Technology](https://img.shields.io/badge/Tech-Vanilla_JS-yellow)
![AI](https://img.shields.io/badge/AI-ChatGPT_Integrated-blue)

## 🚀 Features

### 🎨 **Modern Design**
- Clean, responsive interface with light/dark theme support
- Smooth animations and transitions
- Mobile-first responsive design
- Gradient accent colors and modern typography

### 🛍️ **E-commerce Integration**
- Product carousel for MKBHD collection and hiking shoes
- Full shopping cart functionality
- Checkout flow with shipping and payment
- Real-time cart updates with visual feedback

### 🤖 **ChatGPT Integration**
- Context-aware AI responses
- Intelligent query routing (product vs general queries)
- Dynamic context including cart status, theme, and search history
- Secure API key handling

### 📱 **User Experience**
- Interactive progress bar for chat history navigation
- Voice input support (where available)
- Suggestion pills for quick queries
- Smooth expand/collapse animations

## 🏗️ Architecture

### **Frontend Components**
- `widget.js` - Main controller with state management
- `styles.css` - Complete CSS architecture (1400+ lines)
- `cart.js` - Shopping cart functionality
- `products.js` - Product catalog and carousel logic
- `utils.js` - Helper functions and utilities
- `index.html` - Widget HTML structure

### **Backend**
- `server.js` - Express server with OpenAI API integration
- Environment-based configuration
- CORS support for cross-origin requests
- Error handling and logging

## 🛠️ Setup Instructions

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Environment Configuration**
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=3000
```

### 3. **Start the Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. **Integrate into Your Website**
Add these files to your website and include:

```html
<!-- Load widget dependencies -->
<link rel="stylesheet" href="styles.css">
<script src="utils.js"></script>
<script src="products.js"></script>
<script src="cart.js"></script>
<script src="widget.js"></script>
```

## 🔧 Configuration

### **Query Routing Logic**
The widget automatically routes queries based on content:

**Product Queries** (show carousel):
- Contains "marques brownlee", "mkbhd", or "brownlee"
- Contains "hiking", "shoes", "boots", or "sneaker"

**ChatGPT Queries** (AI response):
- All other queries are sent to ChatGPT

### **Context Awareness**
ChatGPT receives dynamic context including:
- Current cart items count
- User's theme preference (light/dark)
- Recent search history (last 3 searches)

## 📊 Testing

### **Test Pages Included**
- `test.html` - Standalone widget testing
- `test-chatgpt.html` - ChatGPT integration testing with example queries

### **Example Queries**
**Product queries:**
- "marques brownlee shoes"
- "hiking boots"
- "waterproof sneakers"

**ChatGPT queries:**
- "What's the weather like?"
- "Tell me a joke"
- "What do you recommend?"

## 🔒 Security Features

- ✅ Environment variables for API keys
- ✅ Proper `.gitignore` for sensitive files
- ✅ HTML escaping for XSS protection
- ✅ CORS configuration
- ✅ Input validation and error handling

## 🎯 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Responsive

- Optimized for mobile devices
- Touch-friendly interactions
- Responsive breakpoints at 640px
- Mobile-specific optimizations

## 🚨 Important Notes

1. **API Key Security**: Never commit `.env` files to version control
2. **Server Requirement**: ChatGPT features require the Node.js server to be running
3. **CORS**: Server includes CORS headers for cross-origin requests
4. **Dependencies**: Requires Node.js 14+ for server functionality

## 🛡️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for ChatGPT | Yes |
| `PORT` | Server port (default: 3000) | No |

## 📝 License

This project is available for educational and commercial use.

---

**Built with ❤️ using Vanilla JavaScript and modern web technologies**