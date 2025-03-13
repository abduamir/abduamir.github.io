const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const dir = path.join(process.cwd(), 'public', 'pages');
        console.log('Attempting to read directory:', dir); // Debug log
        const files = await fs.readdir(dir);
        console.log('Files found:', files); // Debug log
        const htmlFiles = files
            .filter(f => f.endsWith('.html'))
            .map(f => ({
                name: f.replace('.html', '').replace(/-/g, ' ').replace(/_/g, ' '),
                url: `/pages/${f}`
            }));
        res.status(200).json(htmlFiles);
    } catch (error) {
        console.error('Error in /api/pages:', error.message); // Debug log
        res.status(500).json({ error: 'Failed to load pages', details: error.message });
    }
};