import e from "express";

const router = e.Router();

import { AuthController } from './auth.controller.js';
import passport from "passport";
import { noAuthMiddleware } from "../../middlewares/noAuth.middleware.js";

router.post('/login', noAuthMiddleware(), AuthController.login);
router.post('/register', noAuthMiddleware(), AuthController.register);
router.post('/forgot-password', noAuthMiddleware(), AuthController.forgotPassword);
router.post('/reset-password', noAuthMiddleware(), AuthController.resetPassword);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), AuthController.googleCallback);

export default router;