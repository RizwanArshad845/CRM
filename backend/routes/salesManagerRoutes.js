import express from 'express';
import { getTargets, createTarget, getAgentPerformanceMetrics, updateTargetAchievement } from '../controllers/salesManagerController.js';

const router = express.Router();

router.get('/targets', getTargets);
router.post('/targets', createTarget);
router.patch('/targets/:id/achieved', updateTargetAchievement);
router.get('/agent-performance', getAgentPerformanceMetrics);

export default router;
