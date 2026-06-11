import express from 'express';
import { login, resetPassword, register, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticate, logout);
router.post('/reset-password', authenticate, resetPassword);


export default router;