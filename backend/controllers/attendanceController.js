import pool from '../config/db.js';

// Clock in for the current user
export const clockIn = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Check if already clocked in today
        const checkResult = await pool.query(
            'SELECT id FROM daily_attendance WHERE user_id = $1 AND clock_out IS NULL',
            [userId]
        );

        // 1. Force-close any older open sessions for this user first
        await pool.query(
            'UPDATE daily_attendance SET clock_out = clock_in + interval \'8 hours\' WHERE user_id = $1 AND clock_out IS NULL',
            [userId]
        );

        // 2. Insert new daily_attendance record
        const hour = new Date().getHours();
        const status = hour >= 9 ? 'tardy' : 'on-time';

        const result = await pool.query(
            'INSERT INTO daily_attendance (user_id, clock_in, status, date) VALUES ($1, CURRENT_TIMESTAMP, $2, CURRENT_DATE) RETURNING *',
            [userId, status]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Clock-in error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Clock out for the current user
export const clockOut = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find today's record
        const checkResult = await pool.query(
            'SELECT id FROM daily_attendance WHERE user_id = $1 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1',
            [userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'No active clock-in session for today' });
        }

        const attendanceId = checkResult.rows[0].id;

        // 2. Update clock-out time
        const result = await pool.query(
            'UPDATE daily_attendance SET clock_out = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [attendanceId]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Clock-out error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Get current clock-in status for the user
export const getStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM daily_attendance WHERE user_id = $1 ORDER BY clock_in DESC LIMIT 1',
            [userId]
        );

        res.json({
            success: true,
            isClockedIn: result.rows.length > 0 && result.rows[0].clock_out === null,
            activeSession: result.rows.length > 0 ? result.rows[0] : null
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Get attendance history (Admin View - All users)
export const getAttendanceAll = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                da.id, 
                da.user_id, 
                u.first_name || ' ' || u.last_name as user_name,
                r.name as department,
                da.date, 
                da.clock_in, 
                da.clock_out, 
                da.status,
                EXTRACT(EPOCH FROM (da.clock_out - da.clock_in))/3600 as total_hours
            FROM daily_attendance da
            JOIN users u ON da.user_id = u.id
            JOIN roles r ON u.role_id = r.id
            ORDER BY da.date DESC, da.clock_in DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get all attendance error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Get history for a specific user
export const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM daily_attendance WHERE user_id = $1 ORDER BY date DESC',
            [userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};
