import express from 'express';

// Import controller functions for handling message-related operations
import {getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage} from '../controller/messageController.js';

// Import authentication middleware to protect routes
import {protectRoutes} from '../middleware/auth.js';

// Create a new router instance
const router = express.Router();

router.get('/users', protectRoutes, getUsersForSidebar);
router.get('/:id/', protectRoutes, getMessages);
router.post('/mark/:id', protectRoutes, markMessageAsSeen);
router.post("/send/:id" , protectRoutes, sendMessage);

export default router;