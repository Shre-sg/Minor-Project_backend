const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const mongoURI = "mongodb+srv://shreyasg:P%40ssword@cluster0.xverp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//const mongoURI = "mongodb+srv://shreyasg:P@ssword@cluster0.xverp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

// Define MongoDB Schema and Model
const airQualitySchema = new mongoose.Schema({
  airQuality: Number,
  timestamp: { type: Date, default: Date.now },
});

const AirQuality = mongoose.model("AirQuality", airQualitySchema);

// API Endpoint to Store Data
app.get("/api/put-data", async (req, res) => {
  const { airQuality } = req.query;

  if (airQuality !== undefined) {
    try {
      const newEntry = new AirQuality({ airQuality });
      await newEntry.save(); // Save data in MongoDB

      console.log(`📥 Stored: ${airQuality} PPM`);
      res.status(200).json({ message: "Data saved successfully", airQuality });
    } catch (error) {
      console.error("❌ Error saving data:", error);
      res.status(500).json({ message: "Database error" });
    }
  } else {
    res.status(400).json({ message: "Invalid data format" });
  }
});

// API Endpoint to Retrieve Last 50 Data Entries
app.get("/api/data", async (req, res) => {
  try {
    const data = await AirQuality.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    console.error("❌ Error retrieving data:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
