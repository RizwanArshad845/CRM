import express from 'express';
import { clockIn, clockOut, getStatus, getHistory, getAttendanceAll } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All attendance routes are protected
router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', getStatus);
router.get('/history', getHistory);

// Admin/Reports view all
router.get('/all', getAttendanceAll);

export default router;
