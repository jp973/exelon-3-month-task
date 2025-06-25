import express from 'express';
import { notifyUser, getUserNotifications } from '../../controllers/user/notificationController';

const router = express.Router();

router.post('/', notifyUser);
router.get('/:userId', getUserNotifications); // 👈 New route to get notifications

export default router;
