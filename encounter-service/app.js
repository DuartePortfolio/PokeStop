import express from "express";
import sequelize from "./services/sequelize.js";
import encounterRoutes from "./routes/encounterRoutes.js";

const app = express();
app.use(express.json());
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "encounter-service" });
});
// Mount routes
app.use("/encounters", encounterRoutes);
// Sync database and start server
const PORT = process.env.PORT || 3005;
sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
  app.listen(PORT, () => console.log(`Encounter service running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to sync database:", err);
  process.exit(1);
});