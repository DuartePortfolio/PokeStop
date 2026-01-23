import express from "express";
import * as authenticationController from "../controllers/authenticationController.js";
const router = express.Router();

// public routes
router.post("/register", authenticationController.register);
router.post("/login", authenticationController.login);

export default router;
