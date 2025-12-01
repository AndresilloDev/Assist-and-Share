"use client"

import { useState, ChangeEvent } from "react"
import { UploadCloud, FileText, Trash2, Loader2 } from "lucide-react"
import { MaterialItem } from "./types"
import api from "@/lib/api"

interface EventMaterialsProps {
    materials: MaterialItem[]
    onChange: (newMaterials: MaterialItem[]) => void
}

export default function EventMaterials({
    materials,
    onChange
}: EventMaterialsProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        const currentMaterials = [...materials];

        try {
            const sigRes = await api.get("/cloudinary-signature");
            const { timestamp, signature, apiKey, cloudName, folder } = sigRes.data.value;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();

                formData.append("file", file);
                formData.append("api_key", apiKey);
                formData.append("timestamp", timestamp);
                formData.append("signature", signature);
                formData.append("folder", folder);

                formData.append("use_filename", "true");
                formData.append("unique_filename", "true");

                const cloudRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                    { method: "POST", body: formData }
                );

                if (!cloudRes.ok) {
                    const errorDetails = await cloudRes.text();
                    console.error("Cloudinary Error:", errorDetails);
                    throw new Error("Error en subida a Cloudinary");
                }

                const data = await cloudRes.json();

                const newItem: MaterialItem = {
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                    url: data.secure_url
                };

                currentMaterials.push(newItem);
            }

            onChange(currentMaterials);

        } catch (error) {
            console.error("Error subiendo archivos:", error);
            alert("Error al subir archivo. Verifica tu conexión o intenta de nuevo.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleRemove = (index: number) => {
        const updated = materials.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Materiales y Recursos</h2>

                <label className={`cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                    <span>{uploading ? "Subiendo..." : "Subir archivo"}</span>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        multiple
                        accept=".ppt,.pptx,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        disabled={uploading}
                    />
                </label>
            </div>

            <div className="space-y-3">
                {materials.length === 0 && (
                    <p className="text-gray-500 text-sm italic text-center py-4">
                        No se han subido materiales.
                    </p>
                )}

                {materials.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400 shrink-0">
                                <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-white font-medium hover:text-blue-400 hover:underline truncate block"
                                >
                                    {item.name}
                                </a>
                                <p className="text-xs text-gray-500">{item.size}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="text-gray-500 hover:text-red-400 p-2 cursor-pointer transition-colors"
                            title="Eliminar archivo"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}