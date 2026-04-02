import pool from '../config/db.js';

// Get monthly targets across agents
export const getTargets = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT mt.*, (u.first_name || ' ' || u.last_name) AS agent_name
            FROM monthly_targets mt
            JOIN users u ON mt.user_id = u.id
            ORDER BY mt.target_month DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching targets:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Manager assigns target mapping to a user
export const createTarget = async (req, res) => {
    try {
        const { user_id, assigned_by, target_month, target_amount } = req.body;
        console.log('Attempting to create target:', { user_id, assigned_by, target_month, target_amount });
        
        // achieved_amount is required in DB but doesn't have a default, so we set it to 0
        const result = await pool.query(
            'INSERT INTO monthly_targets (user_id, assigned_by, target_month, target_amount, achieved_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, assigned_by || null, target_month, target_amount, 0]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error creating target:', error);
        res.status(500).json({ success: false, error: `Database error: ${error.message}` });
    }
};

// Dynamic Performance Calculation for Agent Performance Sheet
export const getAgentPerformanceMetrics = async (req, res) => {
    try {
        console.log('☢️ NUCLEAR REFRESH: Calculating Team Performance statistics...');
        
        // Comprehensive query with simplified joins to catch everyone
        const query = `
            SELECT 
                u.id as agent_id, 
                u.first_name, 
                u.last_name, 
                u.status as user_status,
                COALESCE((
                    SELECT SUM(mt.target_amount) 
                    FROM monthly_targets mt 
                    WHERE mt.user_id = u.id
                ), 0) as total_target,
                COALESCE((
                    SELECT SUM(mt.achieved_amount) 
                    FROM monthly_targets mt 
                    WHERE mt.user_id = u.id
                ), 0) as total_achieved,
                (SELECT COUNT(*) FROM call_recordings cr WHERE cr.user_id = u.id) as recording_count
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name ILIKE '%sales%'
            GROUP BY u.id, u.first_name, u.last_name, u.status
            ORDER BY total_achieved DESC;
        `;

        const result = await pool.query(query);
        console.log(`✅ NUCLEAR SUCCESS: Identified ${result.rows.length} sales agents.`);
        
        if (result.rows.length > 0) {
            console.log('Sample Record:', JSON.stringify(result.rows[0]));
        } else {
            console.warn('⚠️ WARNING: No agents matched the search criteria. Checking roles table...');
            const roles = await pool.query("SELECT * FROM roles WHERE name ILIKE '%sales%'");
            console.log('Roles found:', JSON.stringify(roles.rows));
        }

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('❌ NUCLEAR FAILURE in getAgentPerformanceMetrics:', error);
        res.status(500).json({ success: false, error: `Database error: ${error.message}` });
    }
};

// Update target achievement for an agent (Sales Agent manual update or automated)
export const updateTargetAchievement = async (req, res) => {
    const { id } = req.params;
    const { achieved } = req.body;
    try {
        const result = await pool.query(
            'UPDATE monthly_targets SET achieved_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [achieved, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating target achievement:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
