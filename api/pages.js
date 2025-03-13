const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const dir = path.join(process.cwd(), 'public', 'pages');
        const files = await fs.readdir(dir);
        const htmlFiles = files
            .filter(f => f.endsWith('.html'))
            .map(f => ({
                name: f.replace('.html', '').replace(/-/g, ' ').replace(/_/g, ' '),
                url: `/pages/${f}`
            }));
        res.status(200).json(htmlFiles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load pages' });
    }
};