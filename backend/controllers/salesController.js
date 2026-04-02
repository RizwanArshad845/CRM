import pool from '../config/db.js';

// Update how much an agent has achieved against their monthly goal
export const updateAchieved = async (req, res) => {
    try {
        const { id } = req.params;
        const { achieved_amount } = req.body;
        const result = await pool.query(
            'UPDATE monthly_targets SET achieved_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [achieved_amount, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating target:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// View Follow Up Schedules (joined with clients)
export const getFollowUps = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                f.*, 
                c.company_name as client_name, 
                c.contact_no_1 as contact_no,
                u.first_name || ' ' || u.last_name as agent_name
            FROM follow_ups f
            JOIN clients c ON f.client_id = c.id
            JOIN users u ON f.sales_agent_id = u.id
            ORDER BY f.due_date ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching follow ups:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Book Follow up schedules
export const createFollowUp = async (req, res) => {
    try {
        const { user_id, client_id, due_date, notes, status } = req.body;
        const result = await pool.query(
            'INSERT INTO follow_ups (sales_agent_id, client_id, due_date, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, client_id, due_date, notes, status || 'pending']
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error creating follow up:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// View all call recordings with metadata
export const getRecordings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.*,
                u.first_name || ' ' || u.last_name AS agent_name,
                c.company_name AS client_name
            FROM call_recordings r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN clients c ON r.client_id = c.id
            ORDER BY r.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Submit call recordings
export const uploadRecording = async (req, res) => {
    try {
        const { user_id, client_id, recording_url, duration_seconds, transcript, outcome, quality_rating } = req.body;
        const result = await pool.query(
            'INSERT INTO call_recordings (user_id, client_id, recording_url, duration_seconds, transcript, outcome, quality_rating) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, client_id, recording_url, duration_seconds || 0, transcript || '', outcome || 'pending', quality_rating || 0]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error uploading recording:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Delete a Recording
export const deleteRecording = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM call_recordings WHERE id = $1', [id]);
        res.json({ success: true, message: 'Recording deleted successfully' });
    } catch (error) {
        console.error('Error deleting recording:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Update a Recording
export const updateRecording = async (req, res) => {
    try {
        const { id } = req.params;
        const { client_id, recording_url, outcome, quality_rating } = req.body;
        const result = await pool.query(
            `UPDATE call_recordings 
             SET client_id = COALESCE($1, client_id),
                 recording_url = COALESCE($2, recording_url),
                 outcome = COALESCE($3, outcome),
                 quality_rating = COALESCE($4, quality_rating),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 RETURNING *`,
            [client_id, recording_url, outcome, quality_rating, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating recording:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Update an existing Follow Up schedule/status
export const updateFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, due_date, notes, client_id, sales_agent_id } = req.body;
        const result = await pool.query(
            `UPDATE follow_ups 
             SET status = COALESCE($1, status), 
                 due_date = COALESCE($2, due_date), 
                 notes = COALESCE($3, notes),
                 client_id = COALESCE($4, client_id),
                 sales_agent_id = COALESCE($5, sales_agent_id),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [status, due_date, notes, client_id, sales_agent_id, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating follow up:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Delete a Follow Up
export const deleteFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM follow_ups WHERE id = $1', [id]);
        res.json({ success: true, message: 'Follow up deleted successfully' });
    } catch (error) {
        console.error('Error deleting follow up:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
