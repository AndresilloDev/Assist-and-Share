import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

export const noAuthMiddleware = () => (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return next();

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return ApiResponse.error(res, {
            message: "Ya estás autenticado",
            status: 400,
        });
    } catch {
        return next();
    }
};
