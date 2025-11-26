import { ApiResponse } from "../../utils/ApiResponse.js";
import { controllerError } from "../../utils/controllerError.js";
import { getQueryOptions } from "../../utils/getQueryOptions.js";
import { EventService } from "./event.service.js";
import { v2 as cloudinary } from "cloudinary";

export const EventController = {
    getAllEvents: async (req, res) => {
        try {
            const options = getQueryOptions(req);
            const result = await EventService.getAllEvents(options);
            return ApiResponse.success(res, {
                message: "Eventos obtenidos correctamente",
                value: result,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getEventById: async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await EventService.getEventById(eventId);
            return ApiResponse.success(res, {
                message: "Evento obtenido correctamente",
                value: event,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    startEvent: async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await EventService.startEvent(eventId);
            return ApiResponse.success(res, {
                message: "Evento iniciado correctamente",
                value: event,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    completeEvent: async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await EventService.completeEvent(eventId);
            return ApiResponse.success(res, {
                message: "Evento completado correctamente",
                value: event,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    createEvent: async (req, res) => {
        try {
            const data = req.body;
            const newEvent = await EventService.createEvent(data);
            return ApiResponse.success(res, {
                message: "Evento creado correctamente",
                value: newEvent,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    updateEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            const updatedEvent = await EventService.updateEvent(id, data);
            return ApiResponse.success(res, {
                message: `Evento con ID ${id} actualizado correctamente`,
                value: updatedEvent,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    deleteEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await EventService.deleteEvent(id);
            if (!deleted) {
                return ApiResponse.error(res, {
                    message: "Evento no encontrado",
                    status: 404,
                });
            }
            return ApiResponse.success(res, {
                message: `Evento con ID ${id} eliminado correctamente`,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    /* ============================================================
       SUBIR MATERIAL A CLOUDINARY Y GUARDARLO EN LA BD DEL EVENTO
     ============================================================ */
    uploadMaterialToEvent: async (req, res) => {
        try {
            const { id } = req.params;

            if (!req.file) {
                return ApiResponse.error(res, {
                    message: "No se envió ningún archivo",
                    status: 400,
                });
            }

            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            const uploadRes = await cloudinary.uploader.upload(dataURI, {
                folder: "events/materials",
            });

            const material = {
                id: Date.now().toString(),
                name: req.file.originalname,
                url: uploadRes.secure_url,
                uploadDate: new Date(),
            };

            const updatedEvent = await EventService.addMaterialToEvent(id, material);

            return ApiResponse.success(res, {
                message: "Material subido correctamente",
                value: material,
                event: updatedEvent,
            });

        } catch (error) {
            return controllerError(res, error);
        }
    }
};
