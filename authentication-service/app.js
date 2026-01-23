import express from "express";
import authRoutes from "./routes/authenticationRoutes.js";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use("/", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Authentication service running on port ${PORT}`));
