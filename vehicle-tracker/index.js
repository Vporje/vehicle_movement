// server.js
const express = require('express');
const app = express();
const port = 5000;
const locationData = require("./locationData.json")


// API endpoint to fetch route coordinates
app.get('/route-coordinates', (req, res) => {
  res.json(locationData);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
