import express from 'express';
import { login, refresh, logout } from '../controllers/userController';

const router = express.Router();

//Login
router.post('/login', login);
//Refresh Token
router.post('/token/refresh', refresh);
//Logout
router.post('/logout', logout)

export default router;