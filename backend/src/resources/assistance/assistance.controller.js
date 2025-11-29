import { ApiResponse } from "../../utils/ApiResponse.js";
import { controllerError } from "../../utils/controllerError.js";
import { AssistanceService } from "./assistance.service.js";

export const AssistanceController = {
    createAssistance: async (req, res) => {
        const eventId = req.params.eventId;
        const userId = req.session.user.id;

        try {
            const newAssistance = await AssistanceService.createAssistance(eventId, userId);
            return ApiResponse.success(res, {
                message: "Asistencia registrada correctamente",
                value: newAssistance,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    cancelAssistance: async (req, res) => {
        const assistanceId = req.params.assistanceId;
        const userId = req.session.user.id;

        try {
            const cancelledAssistance = await AssistanceService.cancelAssistance(assistanceId, userId);
            return ApiResponse.success(res, {
                message: "Asistencia cancelada correctamente",
                value: cancelledAssistance,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    checkIn: async (req, res) => {
        const assistanceId = req.params.assistanceId;

        try {
            const checkin = await AssistanceService.checkIn(assistanceId);
            return ApiResponse.success(res, {
                message: "Check-in realizado correctamente",
                value: checkin,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    // Versión PÚBLICA (para QR)
    checkInPublic: async (req, res) => {
        const assistanceId = req.params.assistanceId;

        try {
            const checkin = await AssistanceService.checkIn(assistanceId);

            // Redirigir a una página de éxito del front
            return res.redirect(`${process.env.FRONTEND_URL}/checkin-success`);
        } catch (error) {
            const msg = encodeURIComponent(error.message || "Error desconocido");

            return res.redirect(
                `${process.env.FRONTEND_URL}/checkin-error?msg=${msg}`
            );
        }
    },

    updateStatus: async (req, res) => {
        const assistanceId = req.params.assistanceId;
        const { status } = req.body;
        try {
            const updatedAssistance = await AssistanceService.updateStatus(assistanceId, status);
            return ApiResponse.success(res, {
                message: "Estado de asistencia actualizado correctamente",
                value: updatedAssistance,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getByUser: async (req, res) => {
        const userId = req.params.userId;

        try {
            const assistances = await AssistanceService.getByUser(userId);
            console.log("assistances", assistances)
            return ApiResponse.success(res, {
                message: "Asistencias obtenidas correctamente",
                value: assistances,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getMyAssistances: async (req, res) => {
        const userId = req.session.user.id;

        try {
            const assistances = await AssistanceService.getByUser(userId);
            return ApiResponse.success(res, {
                message: "Asistencias obtenidas correctamente",
                value: assistances,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getByEvent: async (req, res) => {
        const eventId = req.params.eventId;

        try {
            const assistances = await AssistanceService.getByEvent(eventId);
            return ApiResponse.success(res, {
                message: "Asistencias obtenidas correctamente",
                value: assistances,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },
}