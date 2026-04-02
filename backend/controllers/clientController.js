import pool from '../config/db.js';

// Get all clients along with their assigned sales and cst agents
export const getClients = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, 
                   s.first_name || ' ' || s.last_name AS submitted_by_name,
                   cst.first_name || ' ' || cst.last_name AS assigned_name
            FROM clients c
            LEFT JOIN users s ON c.sales_agent_id = s.id
            LEFT JOIN users cst ON c.cst_agent_id = cst.id
            ORDER BY c.created_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Create a new client (typically triggered by Sales Agent)
export const createClient = async (req, res) => {
    try {
        const { 
            companyName, customerName, email, paymentAmount, 
            productSold, serviceArea, contactNo1, contactNo2, 
            clientConcerns, tipsForTech, notes, digitalPresence, 
            sales_agent_id 
        } = req.body;

        const safePaymentAmount = isNaN(parseFloat(paymentAmount)) ? 0 : parseFloat(paymentAmount);

        const result = await pool.query(
            `INSERT INTO clients (
                company_name, customer_name, email, payment_amount, 
                product_sold, service_area, contact_no_1, contact_no_2, 
                client_concerns, tips_for_tech, notes, digital_presence, 
                sales_agent_id, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [
                companyName, customerName, email, safePaymentAmount,
                productSold, serviceArea, contactNo1, contactNo2 || null,
                clientConcerns || null, tipsForTech || null, notes || null, digitalPresence || null,
                sales_agent_id, 'onboarding'
            ]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Database error',
            detail: error.detail // Provides specific info like which key failed
        });
    }
};

// Assign a CST Agent to a client and mark as 'active'
export const assignClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { agentId } = req.body;
        const result = await pool.query(
            "UPDATE clients SET cst_agent_id = $1, status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [agentId, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Client not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error assigning client:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Unassign a CST Agent and move back to 'onboarding'
export const unassignClient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE clients SET cst_agent_id = NULL, status = 'onboarding', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Client not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error unassigning client:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};



// General update to a client
export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            companyName, customerName, email, paymentAmount, 
            productSold, serviceArea, contactNo1, contactNo2, 
            clientConcerns, tipsForTech, notes, digitalPresence 
        } = req.body;

        const result = await pool.query(
            `UPDATE clients SET 
                company_name = COALESCE($1, company_name), 
                customer_name = COALESCE($2, customer_name), 
                email = COALESCE($3, email), 
                payment_amount = COALESCE($4, payment_amount), 
                product_sold = COALESCE($5, product_sold), 
                service_area = COALESCE($6, service_area), 
                contact_no_1 = COALESCE($7, contact_no_1), 
                contact_no_2 = COALESCE($8, contact_no_2), 
                client_concerns = COALESCE($9, client_concerns), 
                tips_for_tech = COALESCE($10, tips_for_tech), 
                notes = COALESCE($11, notes), 
                digital_presence = COALESCE($12, digital_presence),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $13 RETURNING *`,
            [
                companyName, customerName, email, paymentAmount,
                productSold, serviceArea, contactNo1, contactNo2,
                clientConcerns, tipsForTech, notes, digitalPresence,
                id
            ]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Quick toggle active / deactivated status
export const toggleClientStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, flag_type } = req.body; // 'active', 'flagged', etc.
        const result = await pool.query(
            'UPDATE clients SET status = $1, flag_type = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [status, flag_type || null, id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error toggling client status:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};

// Get clients whose deactivation has been requested / processed
export const getDeactivationRequests = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, 
                   s.first_name AS sales_agent_first, s.last_name AS sales_agent_last,
                   cst.first_name AS cst_agent_first, cst.last_name AS cst_agent_last
            FROM clients c
            LEFT JOIN users s ON c.sales_agent_id = s.id
            LEFT JOIN users cst ON c.cst_agent_id = cst.id
            WHERE c.status = 'deactivated'
            ORDER BY c.updated_at DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching deactivation requests:', error);
        res.status(500).json({ success: false, error: 'Database connection error' });
    }
};
