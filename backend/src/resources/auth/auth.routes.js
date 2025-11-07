import e from "express";

const router = e.Router();

import { AuthController } from './auth.controller.js';

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
//router.post('/forgot-password', AuthController.forgotPassword);
//router.post('/verify-code', AuthController.verifyCode);

export default router;