import multer from "multer";
import path from "path";
import fs from "fs";
// Setup multer for file uploads
var upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            var uploadDir = path.join(__dirname, "../uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            var ext = path.extname(file.originalname);
            cb(null, "".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 15)).concat(ext));
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: function (req, file, cb) {
        var allowedFileTypes = ['.pdf', '.doc', '.docx'];
        var ext = path.extname(file.originalname).toLowerCase();
        if (allowedFileTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
        }
    }
});
// ✅ Dummy registerRoutes export so app builds
export var registerRoutes = function (app) {
    console.log("registerRoutes() called ✅");
    // Example route:
    // app?.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
    //   if (!req.file) {
    //     return res.status(400).json({ error: 'No file uploaded' });
    //   }
    //   res.json({ message: 'File uploaded successfully', path: req.file.path });
    // });
};
