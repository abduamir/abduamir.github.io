const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Enable CORS for all requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.static('public'));

app.get('/pages', async (req, res) => {
    try {
        const dir = path.join(__dirname, 'public', 'pages');
        const files = await fs.readdir(dir);
        const htmlFiles = files
            .filter(f => f.endsWith('.html'))
            .map(f => ({
                name: f.replace('.html', '').replace(/-/g, ' ').replace(/_/g, ' '),
                url: `/pages/${f}`
            }));
        res.json(htmlFiles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load pages' });
    }
});

module.exports = app;
