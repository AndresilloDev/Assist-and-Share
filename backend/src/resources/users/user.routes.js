import e from "express";
const router = e.Router();

import { UserController } from './user.controller.js';

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

router.get('/:id/events', UserController.getUserEvents);
router.get('/me', UserController.getCurrentUser);
router.patch('/me', UserController.updateCurrentPassword);
router.put('/me', UserController.updateCurrentUser);

export default router;