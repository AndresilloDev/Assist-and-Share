import { buildQuery } from "../../utils/queryBuilder.js";
import { Event } from "../../models/event.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendEmail } from "../../utils/mailer.js";
import { Assistance } from "../../models/assistance.model.js";
import { deleteEventHtml } from "../../utils/html.js";

export const EventService = {
    getAllEvents: async (options) => {
        return await buildQuery(Event, options);
    },

    getEventById: async (id) => {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw ApiError.notFound("Evento no encontrado");
            }
            return event;
        } catch (error) {
            throw error;
        }
    },

    startEvent: async (id) => {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw ApiError.notFound("Evento no encontrado");
            }

            const assistances = await Assistance.find({
                event: id,
                status: { $in: ["approved", "attended"] },
            }).populate("user", "email name");

            if (assistances.length > 0) {
                const emails = [...new Set(assistances.map(a => a.user.email))];

                await sendEmail({
                    bcc: emails,
                    subject: `Inicio del evento: ${event.title}`,
                    text: `El evento "${event.title}" ha sido iniciado. Por favor, revisa los detalles actualizados.`,
                    html: startEventHtml(event),
                });
            }

            event.status = "ongoing";
            await event.save();
            return event;
        } catch (error) {
            throw error;
        }
    },

    completeEvent: async (id) => {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw ApiError.notFound("Evento no encontrado");
            }

            const assistances = await Assistance.find({
                event: id,
                status: { $in: ["approved", "attended"] },
            }).populate("user", "email name");

            if (assistances.length > 0) {
                const emails = [...new Set(assistances.map(a => a.user.email))];

                await sendEmail({
                    bcc: emails,
                    subject: `Finalización del evento: ${event.title}`,
                    text: `El evento "${event.title}" ha sido finalizado. Por favor, revisa los detalles actualizados.`,
                    html: completeEventHtml(event),
                });
            }

            event.status = "completed";
            await event.save();
            return event;
        } catch (error) {
            throw error;
        }
    },

    createEvent: async (data) => {
        try {
            const newEvent = new Event(data);
            await newEvent.save();
            return newEvent;
        } catch (error) {
            throw error;
        }
    },

    updateEvent: async (id, data) => {
        try {
            const event = await Event.findByIdAndUpdate(id, data, { new: true });
            if (!event) {
                throw ApiError.notFound("Evento no encontrado");
            }

            const assistances = await Assistance.find({
                event: id,
                status: { $in: ["approved", "attended"] },
            }).populate("user", "email name");

            if (assistances.length > 0) {
                const emails = [...new Set(assistances.map(a => a.user.email))];

                try {
                    await sendEmail({
                    bcc: emails,
                    subject: `Actualización del evento: ${event.title}`,
                    text: `El evento "${event.title}" ha sido actualizado. Por favor, revisa los detalles actualizados.`,
<<<<<<< HEAD
                    html: updateEventHtml(event),
                });
=======
                    html: `
                        <h2>Actualización del evento: ${event.title}</h2>
                        <p>El evento al que te inscribiste ha sido modificado.</p>
                        <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString()}</p>
                        <p><strong>Modalidad:</strong> ${event.modality}</p>
                        <p><strong>Ubicación/Enlace:</strong> ${event.location || event.link}</p>
                        <p>Por favor revisa los detalles actualizados en la plataforma.</p>
                    `,
                    });
                } catch (emailError) {
                    console.error("No se pudo enviar correo de actualización:", emailError);
                }
>>>>>>> 0a76651b830b8ea40ac8857c912d2ae67aa931d8
            }

            return event;
        } catch (error) {
            throw error;
        }
    },

    deleteEvent: async (id) => {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw ApiError.notFound("Evento no encontrado");
            }

            if (new Date(event.date) < new Date()) {
                throw ApiError.badRequest("No se puede eliminar un evento que ya ocurrió");
            }

            const assistances = await Assistance.find({
                event: id,
                status: { $in: ["approved", "attended"] },
            }).populate("user", "email name");

            if (assistances.length > 0) {
                const emails = [...new Set(assistances.map(a => a.user.email))];

                await sendEmail({
                    bcc: emails,
                    subject: `Eliminación del evento: ${event.title}`,
                    text: `El evento "${event.title}" ha sido eliminado. Por favor, revisa los detalles actualizados.`,
                    html: deleteEventHtml(event),
                });
            }

            const deleted = await event.logicalDelete();
            if (!deleted) {
                throw ApiError.notFound("Evento no encontrado");
            }
            return !!deleted;
        } catch (error) {
            throw error;
        }
    },
};
