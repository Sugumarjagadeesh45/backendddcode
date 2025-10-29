// server.js
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
const socket = require("./socket");

// Load .env variables
dotenv.config();

// ------------------------------
// 🧠 MongoDB Connection
// ------------------------------
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Initialize ride prices after DB connection
    const ridePriceController = require("./controllers/ridePriceController");

    ridePriceController.initializePrices().then(() => {
      console.log("💰 Ride prices initialized and ready");

      // Broadcast initial prices after socket is initialized
      setTimeout(() => {
        try {
          const currentPrices = ridePriceController.getCurrentPrices();
          console.log("📡 Broadcasting initial prices:", currentPrices);

          const socketIO = socket.getIO();
          if (socketIO) {
            socketIO.emit("currentPrices", currentPrices);
            socketIO.emit("priceUpdate", currentPrices);
          }
        } catch (error) {
          console.error("❌ Error broadcasting initial prices:", error);
        }
      }, 2000);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// ------------------------------
// ⚙️ Server + Socket Initialization
// ------------------------------
const server = http.createServer(app);

// Initialize socket.io
socket.init(server);

// Set io instance in app for controllers to access
app.set("io", socket.getIO());

// ------------------------------
// 🚀 Server Listen
// ------------------------------
const PORT = process.env.PORT || 5001;
console.log("🧩 Environment Variables:");
console.log("   MONGODB_URI:", process.env.MONGODB_URI ? "Loaded ✅" : "Missing ❌");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "Loaded ✅" : "Missing ❌");
console.log("   PORT:", process.env.PORT);

server.listen(PORT, () => {
  console.log(`🚀 Server is live and running!`);
  console.log(`🌍 Local URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads available at http://localhost:${PORT}/uploads/`);
});

// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const app = require("./app");
// const http = require("http");
// const socket = require("./socket");

// dotenv.config();



// // In server.js - Update the MongoDB connection section
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverSelectionTimeoutMS: 10000,
//   })
//   .then(() => {
//     console.log("✅ MongoDB connected");
//     // Initialize ride prices after DB connection
//     const ridePriceController = require('./controllers/ridePriceController');
//     ridePriceController.initializePrices().then(() => {
//       console.log('💰 Ride prices initialized and ready');
      
//       // Broadcast initial prices after socket is initialized
//       setTimeout(() => {
//         try {
//           const currentPrices = ridePriceController.getCurrentPrices();
//           console.log('📡 Broadcasting initial prices:', currentPrices);
          
//           const socketIO = socket.getIO();
//           if (socketIO) {
//             socketIO.emit('currentPrices', currentPrices);
//             socketIO.emit('priceUpdate', currentPrices);
//           }
//         } catch (error) {
//           console.error('❌ Error broadcasting initial prices:', error);
//         }
//       }, 2000);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ DB connection error:", err.message);
//   });

// const server = http.createServer(app);

// // Initialize socket.io
// socket.init(server);

// // Set io instance in app for controllers to access
// app.set('io', socket.getIO());

// const PORT = process.env.PORT || 5001;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`📁 Uploads available at http://localhost:${PORT}/uploads/`);
// });