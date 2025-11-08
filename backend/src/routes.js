import express from 'express';
const router = express.Router();

import authRoutes from './resources/auth/auth.routes.js';
import userRoutes from './resources/users/user.routes.js';
//import eventRoutes from './resources/events/event.routes.js';
//import surveyRoutes from './resources/surveys/survey.routes.js';
//import assistanceRoutes from './resources/assistance/assistance.routes.js';

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
//router.use('/users', userRoutes);
//router.use('/events', eventRoutes);
//router.use('/surveys', surveyRoutes);
//router.use('/assistance', assistanceRoutes);

export default router;