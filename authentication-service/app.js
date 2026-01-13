const express = require("express");
const axios = require("axios"); // we'll use this to call the review service
const app = express();

app.use(express.json());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Authentication service running on port ${PORT}`));
