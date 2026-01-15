const express = require("express");
const pokedexRoutes = require("./routes/pokedexRoutes");

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "pokedex-service" });
});

// Mount routes
app.use("/pokedex", pokedexRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Pokedex service running on port ${PORT}`));