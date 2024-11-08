import express from 'express';
import { signUp , login, verifyToken, deleteUser, getUserID } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/verifyToken', verifyToken);
router.delete('/deleteUser/:userId', deleteUser);
router.get('/getID', getUserID);

export default router;