import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const AuthController = {
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const data = await AuthService.login(email, password);
            return ApiResponse.success(res, {
                message: "Inicio de sesión exitoso",
                value: data,
            });
        } catch (error) {
            return ApiResponse.error(res, {
                message: "Error al iniciar sesión",
                error,
                status: 500,
            });
        }
    },

    register: async (req, res) => {
        const { email, password, first_name, last_name, role, speciality } = req.body;

        try {
            const data = await AuthService.register({
                email,
                password,
                first_name,
                last_name,
                role,
                speciality,
            });

            return ApiResponse.success(res, {
                message: "Usuario registrado correctamente",
                value: data,
                status: 201,
            });
        } catch (error) {
            return ApiResponse.error(res, {
                message: "Error al registrar usuario",
                error,
                status: 400,
            });
        }
    },
};
