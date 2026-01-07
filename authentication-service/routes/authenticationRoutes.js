const express = require("express");
const authenticationController = require("../controllers/authenticationController");
const router = express.Router();

// public routes
router.post("/register", authenticationController.register);
router.post("/login", authenticationController.login);

module.exports = router;
