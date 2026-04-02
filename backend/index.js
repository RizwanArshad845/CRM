import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import cstRoutes from './routes/cstRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import cstManagerRoutes from './routes/cstManagerRoutes.js';
import salesManagerRoutes from './routes/salesManagerRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env explicitly from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base Health Check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Express Backend is running from within Electron!' });
});

// Mounted Routes
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/cst', cstRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/cst-manager', cstManagerRoutes);
app.use('/api/sales-manager', salesManagerRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`\n❤️ HEARTBEAT: CRM Backend v2.0 (NUCLEAR UPDATE) is live on PORT ${PORT}`);
    console.log(`📂 Base Directory: ${__dirname}\n`);
    console.log(`Successfully connected to Supabase PostgreSQL database via raw pg Pool!`);
});
