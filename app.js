// D:\app\dummbackend-main\dummbackend-main\app.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// ✅ Import ALL routes FIRST
const adminRoutes = require("./routes/adminRoutes");
const driverRoutes = require("./routes/driverRoutes");
const rideRoutes = require("./routes/rideRoutes");
const groceryRoutes = require("./routes/groceryRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const routeRoutes = require("./routes/routeRoutes");
const ridePriceRoutes = require("./routes/ridePriceRoutes");
const driverLocationHistoryRoutes = require("./routes/driverLocationHistoryRoutes");
const testRoutes = require("./routes/testRoutes"); // ✅ Add test routes

// ✅ Mount routes
app.use("/api/admin", adminRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/groceries", groceryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", ridePriceRoutes);
app.use("/api", driverLocationHistoryRoutes);
app.use("/api/test", testRoutes); // ✅ Test routes

// Test route
app.get("/", (req, res) => {
  res.send("Taxi app API is running...");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;