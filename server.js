const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.static('public'));

app.get('/pages', async (req, res) => {
    try {
        const dir = path.join(__dirname, 'public', 'pages');
        console.log('Reading directory:', dir);
        const files = await fs.readdir(dir);
        console.log('Files found:', files);
        const htmlFiles = files
            .filter(f => f.endsWith('.html'))
            .map(f => ({
                name: f.replace('.html', '').replace(/-/g, ' ').replace(/_/g, ' '),
                url: `/pages/${f}`
            }));
        console.log('HTML files:', htmlFiles);
        res.json(htmlFiles);
    } catch (error) {
        console.error('Error reading pages:', error);
        res.status(500).json({ error: 'Failed to load pages' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});