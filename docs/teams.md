Teams Service - API & Test Notes

Endpoints
- GET /api/teams/user/:userId
  - Get list of teams for the user (protected, requires Authorization Bearer token)

- POST /api/teams/user/:userId
  - Create new team
  - Body: { name: string, members: [instanceId, ...] }
  - Validates ownership of each instance by calling the Collection Service (forwarding Authorization header)
  - Limits: max 6 members

- GET /api/teams/:teamId
  - Get team details (protected)

- PUT /api/teams/:teamId
  - Update team name and/or members
  - Validates ownership and caps at 6 members

- DELETE /api/teams/:teamId
  - Delete a team (only owner)

- POST /api/teams/:teamId/activate
  - Set a team as active for the user (only owner)

How to test locally
1. Rebuild and restart services so the DB schema is applied and team-service dependencies are installed:
   docker-compose up --build -d

2. Create or use an existing user and ensure they have some Pokemon in their collection (via encounter capture flow or seeding).

3. Use the app UI:
   - Open `teams.html` while logged in.
   - Select up to 6 Pokémon from your collection, name the team and click Save — the UI will POST to the backend.
   - Activate, view, or delete teams using the buttons in the UI.

4. Or use curl/Postman to call endpoints (remember to include Authorization header with the Bearer token):
   - curl -H "Authorization: Bearer <token>" http://localhost/api/teams/user/1

Notes
- The service relies on the Collection Service to verify instance ownership. Ensure Collection Service is up and reachable by the team-service container (docker-compose sets SERVICE URLs).
- Database schema file added: `database-schemas/pokestop_teams_db.sql`. If your DB was already created, re-run MySQL or manually apply the SQL.
