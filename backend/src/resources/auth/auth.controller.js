import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError.js";

export const AuthController = {
    login: async (req, res, next) => {
        passport.authenticate("local", { session: false }, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return ApiResponse.error(res, {
                    message: info.message || "Error de autenticación",
                    status: 401,
                });
            }

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            const userData = user.toObject();
            delete userData.password;

            return ApiResponse.success(res, {
                message: "Inicio de sesión exitoso",
                value: { user: userData, token },
            });
        })(req, res, next);
    },

    register: async (req, res) => {
        const { email, password, first_name, last_name, speciality } = req.body;

        try {
            const data = await AuthService.register({
                email,
                password,
                first_name,
                last_name,
                role: "attendee",
                speciality,
            });

            return ApiResponse.success(res, {
                message: "Usuario registrado correctamente",
                value: { user: data, token },
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

    forgotPassword: async (req, res) => {
        const { email } = req.body;
        if (!email) return ApiError.badRequest(res, "El correo electrónico es obligatorio");
        
        try {
            await AuthService.forgotPassword(email);
            return ApiResponse.success(res, {
                message: "Código de verificación enviado al correo",
            });
        } catch (error) {
            return ApiResponse.error(res, {
                message: "Error al enviar código de verificación",
                error,
                status: 400,
            });
        }
    },

    resetPassword: async (req, res) => {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return ApiResponse.error(res, {
                message: "Faltan campos requeridos",
                status: 400,
            });
        }

        try {
            const data = await AuthService.resetPassword(token, newPassword);
            return ApiResponse.success(res, data.message);
        } catch (error) {
            return ApiResponse.error(res, {
                message: "Error al restablecer la contraseña",
                error,
                status: 400,
            });
        }
    },

    googleCallback: (req, res) => {
        const user = req.user;
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        return ApiResponse.success(res, {
            message: "Inicio de sesión con Google exitoso",
            value: { user, token },
        });
    },
};
