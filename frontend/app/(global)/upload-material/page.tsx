"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function UploadMaterialPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [urls, setUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    async function handleUpload() {
        if (files.length === 0) {
            alert("Selecciona al menos un archivo");
            return;
        }

        setLoading(true);

        try {
            // Obtener signature desde el backend (dura unos minutos aguas)
            const sigRes = await api.get("/cloudinary-signature");
            const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data.value;

            const uploadedUrls = [];

            // Subir cada archivo a Cloudinary
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", apiKey);
                formData.append("timestamp", timestamp);
                formData.append("signature", signature);
                formData.append("folder", folder);

                console.log(formData.get("file"));
                console.log(formData.get("api_key"));
                console.log(formData.get("timestamp"));
                console.log(formData.get("signature"));
                console.log(formData.get("folder"));

                const cloudRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const data = await cloudRes.json();
                uploadedUrls.push(data.secure_url);
            }

            setUrls(uploadedUrls);

            // Enviar URLs a la ruta temporal
            // Acá en lugar de esta aberración de implementación, la mandarás junto al body del evento como "materials":[url1, url2, ...]
            await api.post("/events/upload-temporary", {
                urls: uploadedUrls,
            });

            alert("Material subido correctamente");

        } catch (err) {
            console.error(err);
            alert("Error subiendo material");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Subir Material Digital</h2>

            <input
                type="file"
                multiple
                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setFiles(Array.from(e.target.files))}
            />

            <br /><br />

            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Subiendo..." : "Guardar Material"}
            </button>

            {urls.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h3>Material subido:</h3>
                    <ul>
                        {urls.map((url) => (
                            <li key={url}>
                                <a href={url} target="_blank">{url}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
