import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// Get all users with their roles and departments
export const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.status, r.name as role, d.name as department
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.department_id = d.id
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: `Database error: ${error.message}` });
    }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Update user status
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query(
            'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
            [status, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Create a new employee with professional email generation and password hashing
export const createUser = async (req, res) => {
    try {
        const { first_name, last_name, role_id, department_id, password } = req.body;
        
        // 1. Get role name (required for fallback generation)
        const roleResult = await pool.query('SELECT name FROM roles WHERE id = $1', [role_id]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid role ID' });
        }
        
        // 2. Determine email to use
        let emailToUse = req.body.email;
        if (!emailToUse) {
            const roleName = roleResult.rows[0].name.toLowerCase().replace(/\s+/g, '_');
            emailToUse = `${first_name.toLowerCase()}_${roleName}@company.com`;
        }
        
        // 3. Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password || 'welcome123', saltRounds);
        
        // 4. Insert user
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role_id, department_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, last_name, email',
            [first_name, last_name, emailToUse, passwordHash, role_id, department_id, 'active']
        );
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Database error or user already exists' });
    }
};

// Update an existing employee's details
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, role_id, department_id, password } = req.body;
        
        let query, params;
        
        if (password) {
            const bcrypt = await import('bcryptjs');
            const passwordHash = await bcrypt.default.hash(password, 10);
            query = `UPDATE users SET first_name = $1, last_name = $2, email = $3, role_id = $4, department_id = $5, password_hash = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *`;
            params = [first_name, last_name, email, role_id, department_id, passwordHash, id];
        } else {
            query = `UPDATE users SET first_name = $1, last_name = $2, email = $3, role_id = $4, department_id = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`;
            params = [first_name, last_name, email, role_id, department_id, id];
        }

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Hard delete an employee
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Constraint violation or connection error' });
    }
};

// Admin overview of all performance reviews
export const getPerformanceReviews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.*, 
                r.first_name as reviewer_first, r.last_name as reviewer_last,
                e.first_name as employee_first, e.last_name as employee_last
            FROM performance_reviews p
            LEFT JOIN users r ON p.reviewer_id = r.id
            LEFT JOIN users e ON p.user_id = e.id
            ORDER BY p.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching performance reviews:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Get all roles
export const getRoles = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM roles ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ success: false, error: `Database error: ${error.message}` });
    }
};

// Get all departments
export const getDepartments = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM departments ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ success: false, error: `Database error: ${error.message}` });
    }
};
