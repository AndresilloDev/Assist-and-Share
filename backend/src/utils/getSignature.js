import cloudinary from "../config/cloudinary.js";
import { ApiResponse } from "./ApiResponse.js";

export const getSignature = (_, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "event/materials";

        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUD_API_SECRET
        );

        return ApiResponse.success(res, {
            message: "Signature generated successfully",
            value: {
                timestamp,
                signature,
                cloudName: process.env.CLOUD_NAME,
                apiKey: process.env.CLOUD_API_KEY,
                folder: "event/materials",
            },
        });
    } catch (error) {
        return ApiResponse.error(res, {
            message: "Error generating signature",
            error,
        });
    }
}