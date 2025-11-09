import e from "express";
const router = e.Router();

import { UserController } from './user.controller.js';
import { authMiddleware } from "../../middlewares/auth.middleware.js";

router.get('/', authMiddleware(["admin"]), UserController.getAllUsers);
router.get('/:id', authMiddleware(["admin"]), UserController.getUserById);
router.post('/', authMiddleware(["admin"]), UserController.createUser);
router.put('/:id', authMiddleware(["admin"]), UserController.updateUser);
router.delete('/:id', authMiddleware(["admin"]), UserController.deleteUser);

router.get('/:id/events', authMiddleware(["admin"]), UserController.getUserEvents);
router.get('/me', authMiddleware(), UserController.getCurrentUser);
router.patch('/me', authMiddleware(), UserController.updateCurrentPassword);
router.put('/me', authMiddleware(), UserController.updateCurrentUser);

export default router;