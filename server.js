// server.js
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Get API key from environment variable (much safer!)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check if API key exists
if (!OPENAI_API_KEY) {
    console.error('ERROR: OpenAI API key not found in .env file!');
    console.error('Please add OPENAI_API_KEY=your-key-here to .env file');
    process.exit(1);
}

// Enable CORS so your widget can talk to this server
app.use(cors());
app.use(express.json());

// This endpoint will handle ChatGPT requests
app.post('/api/chat', async (req, res) => {
    const { query, context } = req.body;
    
    // Check if query was provided
    if (!query) {
        return res.status(400).json({ error: 'No query provided' });
    }
    
    try {
        console.log('Received query:', query);
        
        // Build dynamic system message with context
        let systemMessage = `You are a helpful assistant for VERTEX, a shoe store website. Keep responses concise and friendly (under 4 sentences).

VERTEX specializes in:
- Hiking boots and outdoor footwear 
- A special Marques Brownlee (MKBHD) collection
- Running shoes and casual footwear

When users ask about products, they can search for:
- "hiking shoes" or "hiking boots" to see outdoor products
- "marques brownlee" to see the MKBHD collection

Be helpful, friendly, and knowledgeable about shoes and footwear.`;

        // Add dynamic context if available
        if (context) {
            if (context.cartItems > 0) {
                systemMessage += `\n\nCurrent session: The user has ${context.cartItems} item${context.cartItems === 1 ? '' : 's'} in their cart.`;
            }
            
            if (context.theme) {
                systemMessage += `\nThey're using ${context.theme} mode on the website.`;
            }
            
            if (context.previousSearches && context.previousSearches.length > 0) {
                const recentSearches = context.previousSearches
                    .filter(s => s.query && s.query.trim())
                    .map(s => `"${s.query}" (${s.type})`)
                    .join(', ');
                if (recentSearches) {
                    systemMessage += `\nRecent searches: ${recentSearches}`;
                }
            }
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: query }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('ChatGPT response received');
        
        res.json({ answer: data.choices[0].message.content });
    } catch (error) {
        console.error('Error calling ChatGPT:', error);
        res.status(500).json({ 
            error: 'Failed to get response from ChatGPT',
            details: error.message 
        });
    }
});

// Use PORT from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('📝 ChatGPT endpoint available at: POST /api/chat');
});