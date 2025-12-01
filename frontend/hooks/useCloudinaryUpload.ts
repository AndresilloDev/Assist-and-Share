import { useState } from "react";
import api from "@/lib/api"; // Asumo que este es tu cliente axios configurado

export const useCloudinary = () => {
    const [uploading, setUploading] = useState(false);

    const uploadFiles = async (files: File[]): Promise<string[]> => {
        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            // 1. Obtener la firma del backend
            const sigRes = await api.get("/cloudinary-signature");
            const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data.value;

            // 2. Subir cada archivo a Cloudinary
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", apiKey);
                formData.append("timestamp", timestamp);
                formData.append("signature", signature);
                formData.append("folder", folder);

                const cloudRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!cloudRes.ok) throw new Error("Error subiendo a Cloudinary");

                const data = await cloudRes.json();
                uploadedUrls.push(data.secure_url);
            }

            return uploadedUrls;

        } catch (error) {
            console.error("Error en uploadFiles:", error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return { uploadFiles, uploading };
};