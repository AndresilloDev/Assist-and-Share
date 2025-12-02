import { ApiResponse } from "../../utils/ApiResponse.js";
import { controllerError } from "../../utils/controllerError.js";
import { ResponseService } from "./response.service.js";

export const ResponseController = {
    createResponse: async (req, res) => {
        try {
            const { answers, comment } = req.body;

            if (!Array.isArray(answers) || answers.length === 0) {
                throw new Error("Debe enviar un arreglo de respuestas");
            }

            for (const a of answers) {
                if (a.rating < 1 || a.rating > 5) {
                    throw new Error("Las puntuaciones deben estar entre 1 y 5");
                }
            }

            const surveyId = req.params.surveyId;

            const userId = req.user.id;

            const newResponse = await ResponseService.createResponse(surveyId, userId, answers, comment);

            return ApiResponse.success(res, {
                message: "Respuesta creada correctamente",
                value: newResponse,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getAllResponses: async (req, res) => {
        try {
            const surveyId = req.params.surveyId;
            const responses = await ResponseService.getAllResponses(surveyId);
            return ApiResponse.success(res, {
                message: "Respuestas obtenidas correctamente",
                value: responses,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getMyResponse: async (req, res) => {
        try {
            const surveyId = req.params.surveyId;

            const userId = req.user.id;

            const response = await ResponseService.getMyResponse(surveyId, userId);
            return ApiResponse.success(res, {
                message: "Respuesta obtenida correctamente",
                value: response,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    updateResponse: async (req, res) => {
        try {
            const { surveyId, responseId } = req.params;

            const userId = req.user.id;

            const data = req.body;
            const updatedResponse = await ResponseService.updateResponse(surveyId, responseId, userId, data);
            return ApiResponse.success(res, {
                message: "Respuesta actualizada correctamente",
                value: updatedResponse,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getSurveySummary: async (req, res) => {
        try {
            const surveyId = req.params.surveyId;
            const summary = await ResponseService.getSurveySummary(surveyId);

            return ApiResponse.success(res, {
                message: "Resumen de la encuesta obtenido correctamente",
                value: summary,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },
};