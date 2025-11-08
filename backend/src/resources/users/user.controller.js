import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { controllerError } from "../../utils/controllerError.js";
import { getQueryOptions } from "../../utils/getQueryOptions.js";
import { UserService } from "./user.service.js";

export const UserController = {
    getAllUsers: async (req, res) => {
        try {
            const options = getQueryOptions(req);
            const result = await UserService.getAllUsers(options);

            return ApiResponse.success(res, {
                message: "Usuarios obtenidos correctamente",
                value: result,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getUserById: async (req, res) => {
        try {
            const userId = req.params.id;
            
            const user = await UserService.getUserById(userId);
            return ApiResponse.success(res, {
                message: "Usuario obtenido correctamente",
                value: user,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
   
            const updatedUser = await UserService.updateUser(id, data);
            
            return ApiResponse.success(res, {
                message: `Usuario con ID ${id} actualizado correctamente`,
                value: updatedUser,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await UserService.deleteUser(id);

            if (!deleted) {
                return ApiResponse.error(res, {
                    message: "Usuario no encontrado",
                    status: 404,
                });
            }
            return ApiResponse.success(res, {
                message: `Usuario con ID ${id} eliminado correctamente`,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getCurrentUser: async (req, res) => {
        try {
            const id = req.session.user.id;
            const user = await UserService.getUserById(id);

            return ApiResponse.success(res, {
                message: "Usuario actual obtenido correctamente",
                value: user,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    updateCurrentUser: async (req, res) => {
        try {
            const id = req.session.user.id;
            const data = req.body;

            const updatedUser = await UserService.updateUser(id, data);

            return ApiResponse.success(res, {
                message: "Usuario actual actualizado correctamente",
                value: updatedUser,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    updateCurrentPassword: async (req, res) => {
        try {
            const id = req.session.user.id;
            const { currentPassword, newPassword } = req.body;
            const updatedUser = await UserService.updateCurrentPassword(id, currentPassword, newPassword);

            return ApiResponse.success(res, {
                message: "Contraseña actualizada correctamente",
                value: updatedUser,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getUserEvents: async (req, res) => {
        try {
            const userId = req.params.id;
            const events = await UserService.getUserEvents(userId);

            return ApiResponse.success(res, {
                message: "Eventos del usuario obtenidos correctamente",
                value: events,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    }
};
