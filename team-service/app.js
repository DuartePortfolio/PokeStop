import express from "express";
import teamRoutes from './routes/teamRoutes.js';
const app = express();
app.use(express.json());
app.use('/teams', teamRoutes);
// Quick health
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'team-service' }));
// Temporary route to verify routing/proxy (public)
app.get('/teams/hello', (req, res) => res.json({ msg: 'teams hello' }));
// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error in team-service:', err);
  res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Team service running on port ${PORT}`));