import express from 'express';
import { updateAchieved, getFollowUps, createFollowUp, updateFollowUp, deleteFollowUp, uploadRecording, deleteRecording, getRecordings, updateRecording } from '../controllers/salesController.js';

const router = express.Router();

router.patch('/targets/:id/achieved', updateAchieved);

router.get('/follow-ups', getFollowUps);
router.post('/follow-ups', createFollowUp);
router.put('/follow-ups/:id', updateFollowUp);
router.delete('/follow-ups/:id', deleteFollowUp);

router.get('/recordings', getRecordings);
router.post('/recordings', uploadRecording);
router.put('/recordings/:id', updateRecording);
router.delete('/recordings/:id', deleteRecording);

export default router;
