import express from 'express';
const router = express.Router();

// Rutas existentes
import authRoutes from './resources/auth/auth.routes.js';
import userRoutes from './resources/users/user.routes.js';
import eventRoutes from './resources/events/event.routes.js';
import assistanceRoutes from './resources/assistance/assistance.routes.js';

import surveyRoutes from './resources/surveys/survey.routes.js';
import responseRoutes from './resources/responses/response.routes.js';

// Nuevos imports CORREGIDOS
import upload from "./middlewares/upload.js";
import { uploadMaterial } from "./resources/uploadResource.js";

//Ruta  para subir archivos con Cloudinary
router.post("/uploads/material", upload.single("file"), uploadMaterial)



// Rutas del sistema
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/assistance', assistanceRoutes);

router.use('/surveys', surveyRoutes);
router.use('/surveys/:surveyId/responses', responseRoutes);

export default router;
