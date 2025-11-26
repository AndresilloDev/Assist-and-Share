"use client";

import MaterialItem from "./MaterialItem";

interface Material {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

interface EventMaterialsProps {
  materials: Material[];
  canEdit: boolean;
  onRemove: (id: string) => void;
}

export default function EventMaterials({ materials, canEdit, onRemove }: EventMaterialsProps) {
  return (
    <section className="mt-10">
      <h3 className="text-2xl font-semibold mb-4">Material del Evento</h3>

      {/* Si no hay archivos */}
      {materials.length === 0 && (
        <p className="text-gray-400">
          No se ha agregado ningún material para este evento.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 mt-4">
        {materials.map((m) => (
          <MaterialItem
            key={m.id}
            material={m}
            canEdit={canEdit}
            onRemove={() => onRemove(m.id)}
          />
        ))}
      </div>
    </section>
  );
}
