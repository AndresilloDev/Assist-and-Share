export class ApiError extends Error {
    constructor(message, status = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.status = status;
        this.code = code;
    }

    static badRequest(message = "Solicitud incorrecta") {
        return new ApiError(message, 400, "BAD_REQUEST");
    }

    static unauthorized(message = "No autorizado") {
        return new ApiError(message, 401, "UNAUTHORIZED");
    }

    static notFound(message = "Recurso no encontrado") {
        return new ApiError(message, 404, "NOT_FOUND");
    }

    static internal(message = "Error interno del servidor") {
        return new ApiError(message, 500, "INTERNAL_ERROR");
    }
}
