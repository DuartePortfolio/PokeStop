const express = require("express");
const axios = require("axios"); // we'll use this to call the review service
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Encounter service running on port ${PORT}`));