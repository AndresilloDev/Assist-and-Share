import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const authMiddleware = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) {
            return ApiError.unauthorized(res, "Usuario no autenticado");
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = { id: decoded.id, role: decoded.role };

            if (roles && !roles.includes(req.user.role)) {
                if (process.env.DEBUG === "true") {
                    console.warn(`Acceso denegado para el rol: ${req.user.role}`);
                }
                return ApiError.forbidden(res, "Acceso denegado");
            }
            next();
        } catch (err) {
            return ApiError.unauthorized(res, "Token inválido o expirado");
        }
    };
};