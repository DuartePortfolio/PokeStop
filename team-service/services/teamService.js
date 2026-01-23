import mysql from 'mysql2/promise';
import axios from 'axios';

const DB_HOST = process.env.DB_HOST || 'db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'enter';
const DB_NAME = process.env.DB_NAME || 'pokestop_teams_db';
const COLLECTION_URL = process.env.COLLECTION_SERVICE_URL || 'http://collection-service:3004';

class TeamService {
  constructor(){
    this.pool = mysql.createPool({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, waitForConnections: true, connectionLimit: 5 });
  }

  async getTeamsByUser(userId){
    const [rows] = await this.pool.query('SELECT * FROM teams WHERE user_id = ?', [userId]);
    // Fetch members
    for (const r of rows){
      const [members] = await this.pool.query('SELECT instance_id, slot FROM team_members WHERE team_id = ? ORDER BY slot', [r.id]);
      r.members = members.map(m=>m.instance_id);
    }
    return rows;
  }

  async createTeam(userId, name, members = [], authHeader){
    if (!name || typeof name !== 'string') throw { status:400, message: 'Name is required' };
    if (!Array.isArray(members)) throw { status:400, message: 'Members must be an array' };
    if (members.length > 6) throw { status:400, message: 'A team can have at most 6 members' };

    // Validate ownership for each member
    for (const inst of members){
      await this._validateOwnership(inst, authHeader);
    }

    const conn = await this.pool.getConnection();
    try{
      await conn.beginTransaction();
      const [res] = await conn.query('INSERT INTO teams (user_id, name) VALUES (?, ?)', [userId, name]);
      const teamId = res.insertId;
      let slot = 1;
      for (const inst of members){
        await conn.query('INSERT INTO team_members (team_id, instance_id, slot) VALUES (?, ?, ?)', [teamId, inst, slot++]);
      }
      await conn.commit();
      return { id: teamId, user_id: userId, name, members };
    }catch(err){
      await conn.rollback();
      throw err;
    }finally{ conn.release(); }
  }

  async getTeamById(teamId){
    const [rows] = await this.pool.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (!rows.length) return null;
    const t = rows[0];
    const [members] = await this.pool.query('SELECT instance_id, slot FROM team_members WHERE team_id = ? ORDER BY slot', [teamId]);
    t.members = members.map(m=>m.instance_id);
    return t;
  }

  async updateTeam(teamId, userId, name, members = [], authHeader){
    const team = await this.getTeamById(teamId);
    if (!team) return false;
    if (String(team.user_id) !== String(userId)) return false;

    if (members && members.length > 6) throw { status:400, message: 'A team can have at most 6 members' };
    // validate ownership
    for (const inst of members){ await this._validateOwnership(inst, authHeader); }

    const conn = await this.pool.getConnection();
    try{
      await conn.beginTransaction();
      if (name) await conn.query('UPDATE teams SET name = ? WHERE id = ?', [name, teamId]);
      if (Array.isArray(members)){
        await conn.query('DELETE FROM team_members WHERE team_id = ?', [teamId]);
        let slot = 1;
        for (const inst of members){ await conn.query('INSERT INTO team_members (team_id, instance_id, slot) VALUES (?, ?, ?)', [teamId, inst, slot++]); }
      }
      await conn.commit();
      return true;
    }catch(err){ await conn.rollback(); throw err; }finally{ conn.release(); }
  }

  async deleteTeam(teamId, userId){
    const team = await this.getTeamById(teamId);
    if (!team) return false;
    if (String(team.user_id) !== String(userId)) return false;
    const [res] = await this.pool.query('DELETE FROM teams WHERE id = ? AND user_id = ?', [teamId, userId]);
    return res.affectedRows > 0;
  }

  async activateTeam(teamId, userId){
    const team = await this.getTeamById(teamId);
    if (!team) return false;
    if (String(team.user_id) !== String(userId)) return false;
    const conn = await this.pool.getConnection();
    try{
      await conn.beginTransaction();
      await conn.query('UPDATE teams SET is_active = 0 WHERE user_id = ?', [userId]);
      await conn.query('UPDATE teams SET is_active = 1 WHERE id = ? AND user_id = ?', [teamId, userId]);
      await conn.commit();
      return true;
    }catch(err){ await conn.rollback(); throw err; }finally{ conn.release(); }
  }

  async _validateOwnership(instanceId, authHeader){
    if (!instanceId) throw { status:400, message: 'Invalid instance id' };
    try{
      const headers = {};
      if (authHeader) headers['Authorization'] = authHeader;
      const url = `${COLLECTION_URL}/pokemon/${encodeURIComponent(instanceId)}`;
      const res = await axios.get(url, { headers });
      // collection service will enforce ownership and return 200 if owned
      if (res.status !== 200) throw { status:403, message: 'Not your Pokemon' };
    }catch(err){
      if (err.response && err.response.status === 403) throw { status:403, message: 'Not your Pokemon' };
      if (err.response && err.response.status === 404) throw { status:400, message: 'Pokemon instance not found' };
      throw { status:500, message: 'Ownership validation failed' };
    }
  }
}

export default TeamService;
