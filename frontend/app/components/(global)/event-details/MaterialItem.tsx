"use client";

import { Download, X } from "lucide-react";

// --- Tipos e Interfaces ---
interface Material {
  id: string;
  name: string;
  type?: string;
  uploadDate: string;
  url: string;
}

interface MaterialItemProps {
  material: Material;
  canEdit: boolean;
  onRemove: () => void;
}

// --- Configuración de Iconos ---
const MATERIAL_ICONS: Record<string, { bg: string; icon: string }> = {
  pptx: { bg: "bg-orange-500", icon: "PPT" },
  xlsx: { bg: "bg-green-500", icon: "XLS" },
  pdf: { bg: "bg-red-500", icon: "PDF" },
  docx: { bg: "bg-blue-500", icon: "DOC" },
  other: { bg: "bg-gray-700", icon: "FILE" },
};

// --- Funciones Auxiliares ---

// Detecta si es imagen para mostrar miniatura
function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

// Detecta extensión para elegir color e icono
function detectFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return MATERIAL_ICONS[ext] ? ext : "other";
}

// Genera URL de descarga forzada (Simple)
function getDownloadUrl(url: string) {
  // Simplemente inyectamos 'fl_attachment' si no existe.
  // Esto fuerza al navegador a descargar el archivo en lugar de abrirlo.
  if (url.includes("/upload/") && !url.includes("fl_attachment")) {
    return url.replace("/upload/", "/upload/fl_attachment/");
  }
  return url;
}

// --- Componente Principal ---
export default function MaterialItem({ material, canEdit, onRemove }: MaterialItemProps) {
  const fileType = detectFileType(material.name);
  const iconData = MATERIAL_ICONS[fileType];
  const isImg = isImage(material.url);
  const downloadUrl = getDownloadUrl(material.url);

  return (
    <div
      className="group/item relative bg-gray-950 rounded-xl p-4 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-all duration-300 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
      }}
    >
      {/* Efecto de luz al pasar el mouse */}
      <div
        className="pointer-events-none absolute opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 -inset-px rounded-xl"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.08), transparent 40%)"
        }}
      />

      {/* Contenido Izquierdo: Icono/Preview + Info */}
      <div className="relative z-10 flex items-center gap-4">
        {isImg ? (
          <img
            src={material.url}
            alt={material.name}
            className="w-14 h-14 object-cover rounded-lg border border-gray-800"
          />
        ) : (
          <div
            className={`${iconData.bg} w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
          >
            {iconData.icon}
          </div>
        )}

        <div>
          <p className="text-white font-semibold truncate max-w-[200px]">{material.name}</p>
          <p className="text-gray-400 text-sm">Subido el {material.uploadDate}</p>
        </div>
      </div>

      {/* Contenido Derecho: Acciones */}
      <div className="relative z-10 flex items-center gap-2">
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
          title="Descargar"
        >
          <Download className="text-gray-400 hover:text-white transition-colors" size={20} />
        </a>

        {/* {canEdit && (
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors duration-300"
            title="Eliminar"
          >
            <X className="text-gray-400 hover:text-red-400 transition-colors" size={20} />
          </button>
        )} */}
      </div>
    </div>
  );
}