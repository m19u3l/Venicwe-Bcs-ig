import express from "express";
const router = express.Router();

// === ${file^} ROUTES ===
// (TODO: Add DB logic later)

router.get("/", (req, res) => {
  res.json({ message: "${file^} API endpoint running 🚀" });
});

export default router;
