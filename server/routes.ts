import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedFileTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// ✅ Dummy registerRoutes export so app builds
export const registerRoutes = (app?: Express) => {
  console.log("registerRoutes() called ✅");

  // Example route:
  // app?.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  //   if (!req.file) {
  //     return res.status(400).json({ error: 'No file uploaded' });
  //   }
  //   res.json({ message: 'File uploaded successfully', path: req.file.path });
  // });
};

