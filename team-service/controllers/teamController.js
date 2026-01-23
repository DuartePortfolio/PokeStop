import TeamService from '../services/teamService.js';
const teamService = new TeamService();

// GET /teams/user/:userId
export async function getUserTeams(req, res) {
  const userId = Number(req.params.userId);
  try {
    const teams = await teamService.getTeamsByUser(userId);
    res.json({ userId, count: teams.length, teams });
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

// POST /teams/user/:userId
export async function createTeam(req, res) {
  const userId = Number(req.params.userId);
  const { name, members } = req.body;
  try {
    const team = await teamService.createTeam(userId, name, members, req.headers.authorization);
    res.status(201).json(team);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to create team' });
  }
};

// GET /teams/:teamId
export async function getTeamById(req, res) {
  const teamId = Number(req.params.teamId);
  try {
    const team = await teamService.getTeamById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    // check ownership
    if (String(team.user_id) !== String(req.user.id)) return res.status(403).json({ error: 'Access denied' });
    res.json(team);
  } catch (err) {
    console.error('Error getting team:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

// PUT /teams/:teamId
export async function updateTeam(req, res) {
  const teamId = Number(req.params.teamId);
  const { name, members } = req.body;
  try {
    const updated = await teamService.updateTeam(teamId, req.user.id, name, members, req.headers.authorization);
    if (!updated) return res.status(404).json({ error: 'Team not found or access denied' });
    res.json({ updated: true });
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to update team' });
  }
};

// DELETE /teams/:teamId
export async function deleteTeam(req, res) {
  const teamId = Number(req.params.teamId);
  try {
    const deleted = await teamService.deleteTeam(teamId, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Team not found or access denied' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

// POST /teams/:teamId/activate
export async function activateTeam(req, res) {
  const teamId = Number(req.params.teamId);
  try {
    const ok = await teamService.activateTeam(teamId, req.user.id);
    if (!ok) return res.status(404).json({ error: 'Team not found or access denied' });
    res.json({ activated: true });
  } catch (err) {
    console.error('Error activating team:', err);
    res.status(500).json({ error: 'Failed to activate team' });
  }
};
