const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const landingPageRoutes = require("./routes/landingPageRoutes");

const app = express();

/* CONNECT DATABASE */
connectDB();

/* CORS CONFIGURATION */
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

/* BODY PARSER */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/landing", landingPageRoutes);

/* HEALTH CHECK */
app.get("/api/health", (req, res) => {
  res.json({
    status: "MetaBull API running 🚀",
    port: process.env.PORT || 5000
  });
});

/* START SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});