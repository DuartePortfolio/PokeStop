const express = require("express");
const axios = require("axios"); // we'll use this to call the review service
const app = express();

app.use(express.json());

