import express from 'express';
import {
    getActiveClients,
    requestDeactivation, flagClient,
    getSchedules, createSchedule, updateSchedule, deleteSchedule
} from '../controllers/cstController.js';

const router = express.Router();

// Active Clients
router.get('/active-clients', getActiveClients);

// Client Actions
router.post('/deactivation-requests', requestDeactivation);
router.post('/flags', flagClient);

// Schedules CRUD
router.get('/schedules', getSchedules);
router.post('/schedules', createSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

export default router;
