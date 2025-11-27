import { Assistance } from "../../models/assistance.model.js";
import { Event } from "../../models/event.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const AssistanceService = {
    createAssistance: async (eventId, userId) => {
        try {
            const event = await Event.findById(eventId);
            if (!event) {
                throw new ApiError.notFound("Evento no encontrado");
            }

            if (event.date < new Date()) {
                throw new ApiError.badRequest("No se puede registrar a un evento que ya ocurrió");
            }

            const exists = await Assistance.findOne({
                event: eventId,
                user: userId,
                status: { $in: ["pending", "approved", "attended", "cancelled"] },
            });

            if (exists && exists.status !== "cancelled") {
                throw new ApiError.badRequest("Ya tienes una asistencia registrada para este evento");
            } else if (exists && exists.status === "cancelled") {
                exists.status = "pending";
                await exists.save();
                return exists;
            }

            if (event.modality !== "online" && event.capacity) {
                const activeCount = await Assistance.countDocuments({
                    event: eventId,
                    status: { $in: ["pending", "approved", "attended"] },
                });

                if (activeCount >= event.capacity) {
                    throw new ApiError.badRequest("La capacidad del evento ha sido alcanzada");
                }
            }

            const newAssistance = await Assistance.create({
                event: eventId,
                user: userId,
                status: "pending",
            });
            return newAssistance;
        } catch (error) {
            throw error;
        }
    },

    cancelAssistance: async (assistanceId, userId) => {
        try {
            const assistance = await Assistance.findById(assistanceId);
            if (!assistance) {
                throw new ApiError.notFound("Asistencia no encontrada");
            }

            if (assistance.user.toString() !== userId) {
                throw new ApiError.forbidden("No tienes permiso para cancelar esta asistencia");
            }
            assistance.status = "cancelled";
            await assistance.save();
            return assistance;
        } catch (error) {
            throw error;
        }
    },

    checkIn: async (assistanceId) => {
        const assistance = await Assistance.findById(assistanceId);
        if (!assistance) throw new ApiError.notFound("Asistencia no encontrada");

        assistance.status = "attended";
        assistance.checkInTime = new Date();
        await assistance.save();

        return assistance;
    },

    updateStatus: async (assistanceId, status) => {
        try {
            const assistance = await Assistance.findById(assistanceId);
            if (!assistance) {
                throw new ApiError.notFound("Asistencia no encontrada");
            }

            if (assistance.status.toString() === "cancelled") {
                throw new ApiError.badRequest("No se puede actualizar una asistencia cancelada");
            }

            assistance.status = status;
            if (status === "attended") {
                assistance.checkInTime = new Date();
            }
            await assistance.save();
            return assistance;
        } catch (error) {
            throw error;
        }
    },

    getByUser: async (userId) => {
        try {
            const assistances = await Assistance.find({ user: userId }).populate("event");
            return assistances;
        } catch (error) {
            throw error;
        }
    },

    getByEvent: async (eventId) => {
        try {
            console.log("received petition")
            const assistances = await Assistance.find({ event: eventId }).populate("user");
            return assistances;
        } catch (error) {
            throw error;
        }
    },
};
