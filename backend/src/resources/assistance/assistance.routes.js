import e from "express";
const router = e.Router();

import { AssistanceController } from './assistance.controller.js';
import { authMiddleware } from "../../middlewares/auth.middleware.js";

// Registrar asistencia (status = pending)
router.post("/:eventId", authMiddleware(["attendee"]), AssistanceController.createAssistance);

// Cancelar asistencia por parte del asistente
router.delete("/:assistanceId", authMiddleware(["attendee"]), AssistanceController.cancelAssistance);

/**
 * Al momento de escanear el QR code del evento, se registra la hora de check-in y se actualiza el estado a "attended"
 * Este endpoint se usa al momento de que un organizador o presentador escanee el código QR del asistente, en caso de que el evento sea presencial
 * En caso de ser un evento virtual, se puede usar este endpoint para registrar la asistencia una vez que el asistente ingrese al evento (Ej. al abrir el enlace de Zoom o Meet)
 */
router.patch('/checkin/:assistanceId', authMiddleware(["presenter", "admin"]), AssistanceController.checkIn);

// Ruta que se abre desde el QR, SIN autenticación
router.get("/checkin/:assistanceId", AssistanceController.checkInPublic);

// Actualizar estado (approve / reject / attended / cancelled)
router.patch("/status/:assistanceId", authMiddleware(["presenter", "admin", "attendee"]), AssistanceController.updateStatus);

// Obtener asistencias de un usuario
router.get("/user/:userId", authMiddleware(["attendee", "presenter", "admin"]), AssistanceController.getByUser);

// Obtener asistencias de un evento
router.get("/event/:eventId", authMiddleware(["presenter", "admin", "attendee"]), AssistanceController.getByEvent);

export default router;