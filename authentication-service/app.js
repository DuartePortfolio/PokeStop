const express = require("express");
const app = express();
const authRoutes = require("./routes/authenticationRoutes");

app.use(express.json({ limit: '10mb' }));
app.use("/", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Authentication service running on port ${PORT}`));
