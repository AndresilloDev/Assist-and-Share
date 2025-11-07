export class ApiResponse {
    static success(res, { message = "Operación exitosa", value = null, status = 200 }) {
        return res.status(status).json({
            success: true,
            message,
            value,
            status,
        });
    }

    static error(res, { message = "Error en la operación", error = null, status = 500 }) {
        if (process.env.DEBUG == "true") {
            console.error(error)
        }
        return res.status(status).json({
            success: false,
            message,
            error: error?.message || error,
            status,
        });
    }
}
