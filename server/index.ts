import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors({
  origin: [
    "http://getcanvapro.in",
    "https://getcanvapro.in",
    "http://www.getcanvapro.in",
    "https://www.getcanvapro.in",
    "http://localhost:3000"
  ],
  credentials: true,
}));

app.use(express.json());

// ✅ Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Fallback for SPA (React router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Live at http://localhost:${PORT}`);
});
