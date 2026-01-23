import express from "express";
import * as teamController from "../controllers/teamController.js";
import { authenticateToken, authorizeSelf } from "../middleware/authenticator.js";
const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Get all teams for a user
router.get('/user/:userId', authorizeSelf, teamController.getUserTeams);
// Create a new team for a user
router.post('/user/:userId', authorizeSelf, teamController.createTeam);

// Team-specific actions
router.get('/:teamId', teamController.getTeamById);
router.put('/:teamId', teamController.updateTeam);
router.delete('/:teamId', teamController.deleteTeam);
router.post('/:teamId/activate', teamController.activateTeam);

export default router;