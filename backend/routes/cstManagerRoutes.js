import express from 'express';
import { assignCstAgent, unassignCstAgent, resolveDeactivation, getTargets, upsertTarget, getStrategies, upsertStrategy, deleteStrategy } from '../controllers/cstManagerController.js';

const router = express.Router();

router.patch('/clients/:id/assign-cst', assignCstAgent);
router.patch('/clients/:id/unassign-cst', unassignCstAgent);
router.patch('/deactivation-requests/:id/resolve', resolveDeactivation);

router.get('/targets', getTargets);
router.post('/targets', upsertTarget);

router.get('/strategies', getStrategies);
router.post('/strategies', upsertStrategy);
router.delete('/strategies/:client_id', deleteStrategy);

export default router;
