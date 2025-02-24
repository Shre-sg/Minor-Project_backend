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

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

/* ------------------- Air Quality Schema ------------------- */
const airQualitySchema = new mongoose.Schema({
  airQuality: Number,
  timestamp: { type: Date, default: Date.now },
});

const AirQuality = mongoose.model("AirQuality", airQualitySchema);

/* ------------------- Ward Management Schema ------------------- */
const facilitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String }, // URL or path for the icon
});

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  facilities: [facilitySchema],
});

const Ward = mongoose.model("Ward", wardSchema);

/* ------------------- Air Quality API Endpoints ------------------- */

// Store Air Quality Data
app.get("/api/put-data", async (req, res) => {
  const { airQuality } = req.query;

  if (airQuality !== undefined) {
    try {
      const newEntry = new AirQuality({ airQuality });
      await newEntry.save();

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

// Retrieve Last 50 Air Quality Data Entries
app.get("/api/data", async (req, res) => {
  try {
    const data = await AirQuality.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    console.error("❌ Error retrieving data:", error);
    res.status(500).json({ message: "Database error" });
  }
});

/* ------------------- Ward Management API Endpoints ------------------- */

// Create a New Ward
app.post("/api/wards", async (req, res) => {
  const { name, facilities } = req.body;

  if (!name || !facilities) {
    return res.status(400).json({ message: "Name and facilities are required" });
  }

  try {
    const newWard = new Ward({ name, facilities });
    await newWard.save();

    console.log(`🏥 New Ward Created: ${name}`);
    res.status(201).json(newWard);
  } catch (error) {
    console.error("❌ Error creating ward:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Get All Wards
app.get("/api/wards", async (req, res) => {
  try {
    const wards = await Ward.find();
    res.json(wards);
  } catch (error) {
    console.error("❌ Error fetching wards:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Get Single Ward by ID
app.get("/api/wards/:id", async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) return res.status(404).json({ message: "Ward not found" });

    res.json(ward);
  } catch (error) {
    console.error("❌ Error fetching ward:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Delete a Ward by ID
app.delete("/api/wards/:id", async (req, res) => {
  try {
    const deletedWard = await Ward.findByIdAndDelete(req.params.id);
    if (!deletedWard) return res.status(404).json({ message: "Ward not found" });

    console.log(`🗑️ Ward Deleted: ${deletedWard.name}`);
    res.json({ message: "Ward deleted", deletedWard });
  } catch (error) {
    console.error("❌ Error deleting ward:", error);
    res.status(500).json({ message: "Database error" });
  }
});

/* ------------------- Start Server ------------------- */
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
