const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for received data
const airQualityData = [];

// API endpoint to receive data
app.get("/api/put-data", (req, res) => {
  const { airQuality } = req.query;

  if (airQuality !== undefined) {
    if(airQualityData.length > 50) {
      airQualityData.shift();
    }
    const timestamp = new Date().toISOString();
    // Store the data in memory
    airQualityData.push({ airQuality, timestamp });

    console.log(`Received: ${airQuality} PPM at ${timestamp}`);
    res.status(200).json({ message: "Data received successfully", airQuality });
  } else {
    res.status(400).json({ message: "Invalid data format" });
  }
});

// API endpoint to retrieve data (for testing/display in React frontend)
app.get("/api/data", (req, res) => {
  res.json(airQualityData);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
