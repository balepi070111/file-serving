const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const multer = require('multer');

// uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// allow ONLY html files
const upload = multer({
    dest: uploadDir,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/html') {
            cb(null, true);
        } else {
            cb(new Error('Only HTML files are allowed'));
        }
    }
}).single('file');

const server = http.createServer((req, res) => {

    // 🔹 upload route
    if (req.method === 'POST' && req.url === '/upload') {
        upload(req, res, (err) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end(`<h1>${err.message}</h1>`);
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>HTML file uploaded successfully</h1>');
        });
        return;
    }

    
    let filePath = path.join(
        __dirname,
        'public',
        req.url === '/' ? 'index.html' : req.url
    );

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, {
                'Content-Type': mime.lookup(filePath) || 'text/html'
            });
            res.end(content);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});