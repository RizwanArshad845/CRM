import pool from '../config/db.js';

// Get departmental performance stats (aggregated from live data)
export const getPerformanceStats = async (req, res) => {
    try {
        // 1. Sales Performance
        const salesStats = await pool.query(`
            SELECT 
                u.id, 
                u.first_name || ' ' || u.last_name as name, 
                r.name as role,
                COALESCE(SUM(c.payment_amount), 0) as monthly_revenue,
                COALESCE(SUM(mt.target_amount), 100000) as target_revenue,
                COUNT(c.id) as deals_closed,
                (SELECT COUNT(*) FROM call_recordings WHERE user_id = u.id) as calls_made,
                (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'completed') as tasks_completed,
                (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status != 'completed' AND due_date < CURRENT_DATE) as tasks_missed,
                COALESCE((
                    SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            ELSE ROUND((COUNT(CASE WHEN status = 'on-time' THEN 1 END)::FLOAT + COUNT(CASE WHEN status = 'tardy' THEN 1 END)::FLOAT * 0.7) / COUNT(*)::FLOAT * 100)
                        END
                    FROM daily_attendance 
                    WHERE user_id = u.id AND date >= date_trunc('month', CURRENT_DATE)
                ), 0) as attendance_score,
                ROUND(COALESCE(
                    (SELECT AVG(quality_rating) FROM call_recordings WHERE user_id = u.id) * 0.5 +
                    (SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 100 
                            ELSE (COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100 
                        END 
                     FROM tasks WHERE assigned_to = u.id) * 0.3 +
                    (SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            ELSE (COUNT(CASE WHEN status = 'on-time' THEN 1 END)::FLOAT + COUNT(CASE WHEN status = 'tardy' THEN 1 END)::FLOAT * 0.7) / COUNT(*)::FLOAT * 100
                        END
                    FROM daily_attendance WHERE user_id = u.id AND date >= date_trunc('month', CURRENT_DATE)) * 0.2,
                    0
                )::NUMERIC, 1) as overall_score
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN clients c ON u.id = c.sales_agent_id
            LEFT JOIN monthly_targets mt ON u.id = mt.user_id AND date_trunc('month', mt.target_month) = date_trunc('month', CURRENT_DATE)
            WHERE r.name IN ('sales', 'sales_manager')
            GROUP BY u.id, u.first_name, u.last_name, r.name
        `);

        // 2. CST Performance
        const cstStats = await pool.query(`
            SELECT 
                u.id, 
                u.first_name || ' ' || u.last_name as name, 
                r.name as role,
                (SELECT COUNT(*) FROM clients WHERE cst_agent_id = u.id) as clients_managed,
                (SELECT ROUND(AVG(rating), 1) FROM performance_reviews WHERE user_id = u.id) as satisfaction_score,
                (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'completed') as tasks_completed,
                (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status != 'completed' AND due_date < CURRENT_DATE) as tasks_missed,
                COALESCE((
                    SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            ELSE ROUND((COUNT(CASE WHEN status = 'on-time' THEN 1 END)::FLOAT + COUNT(CASE WHEN status = 'tardy' THEN 1 END)::FLOAT * 0.7) / COUNT(*)::FLOAT * 100)
                        END
                    FROM daily_attendance 
                    WHERE user_id = u.id AND date >= date_trunc('month', CURRENT_DATE)
                ), 0) as attendance_score,
                ROUND(COALESCE(
                    (SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 100 
                            ELSE (COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100 
                        END 
                     FROM tasks WHERE assigned_to = u.id) * 0.7 +
                    (SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            ELSE (COUNT(CASE WHEN status = 'on-time' THEN 1 END)::FLOAT + COUNT(CASE WHEN status = 'tardy' THEN 1 END)::FLOAT * 0.7) / COUNT(*)::FLOAT * 100
                        END
                    FROM daily_attendance WHERE user_id = u.id AND date >= date_trunc('month', CURRENT_DATE)) * 0.3,
                    0
                )::NUMERIC, 1) as overall_score
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name IN ('cst', 'cst_manager')
            GROUP BY u.id, u.first_name, u.last_name, r.name
        `);

        // 3. Finance Performance
        const financeStats = await pool.query(`
            SELECT 
                u.id, 
                u.first_name || ' ' || u.last_name as name, 
                r.name as role,
                (SELECT COUNT(*) FROM payrolls WHERE processed_by = u.id) as payments_processed,
                (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'completed') as tasks_completed,
                (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status != 'completed' AND due_date < CURRENT_DATE) as tasks_missed,
                COALESCE((
                    SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            ELSE ROUND((COUNT(CASE WHEN status = 'on-time' THEN 1 END)::FLOAT + COUNT(CASE WHEN status = 'tardy' THEN 1 END)::FLOAT * 0.7) / COUNT(*)::FLOAT * 100)
                        END
                    FROM daily_attendance 
                    WHERE user_id = u.id AND date >= date_trunc('month', CURRENT_DATE)
                ), 0) as attendance_score,
                ROUND(COALESCE(
                    (SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 100 
                            ELSE (COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100 
                        END 
                     FROM tasks WHERE assigned_to = u.id) * 0.7 +
                    (SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            ELSE (COUNT(CASE WHEN status = 'on-time' THEN 1 END)::FLOAT + COUNT(CASE WHEN status = 'tardy' THEN 1 END)::FLOAT * 0.7) / COUNT(*)::FLOAT * 100
                        END
                    FROM daily_attendance WHERE user_id = u.id AND date >= date_trunc('month', CURRENT_DATE)) * 0.3,
                    0
                )::NUMERIC, 1) as overall_score
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name IN ('finance')
            GROUP BY u.id, u.first_name, u.last_name, r.name
        `);

        res.json({
            success: true,
            data: {
                sales: salesStats.rows,
                cst: cstStats.rows,
                finance: financeStats.rows
            }
        });
    } catch (error) {
        console.error('FATAL ERROR in getPerformanceStats:', error);
        res.status(500).json({ success: false, error: `Database error: ${error.message}` });
    }
};

// Get Company metrics for Admin Dashboard
export const getCompanyMetrics = async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(payment_amount), 0) FROM clients WHERE status = 'active') as total_revenue,
                (SELECT COUNT(*) FROM clients WHERE status = 'active') as active_clients,
                (SELECT COUNT(*) FROM users WHERE status = 'active') as total_employees
        `);
        
        res.json({
            success: true,
            data: {
                ...stats.rows[0],
                revenue_target: 300000,
                client_retention: 89,
                employee_satisfaction: 87
            }
        });
    } catch (error) {
        console.error('Error fetching company metrics:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Get detailed task entries
export const getTaskDetails = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.id, 
                u.first_name || ' ' || u.last_name as employee_name, 
                t.title, 
                t.priority, 
                t.status, 
                t.due_date,
                t.category
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            ORDER BY t.due_date ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching task details:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};
