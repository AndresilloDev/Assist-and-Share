import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "El título es obligatorio"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        capacity: {
            type: Number,
            required: function () {
                return this.modality === "in-person";
            },
            min: [1, "La capacidad mínima debe ser 1"],
        },
        duration: {
            type: Number,
            required: [true, "La duración es obligatoria"],
            min: [1, "La duración mínima debe ser 1 minuto"],
        },
        modality: {
            type: String,
            enum: ["in-person", "online", "hybrid"],
            required: [true, "La modalidad es obligatoria"],
        },
        date: {
            type: Date,
            required: [true, "La fecha es obligatoria"],
            validate: {
                validator: (v) => v > new Date(),
                message: "La fecha del evento debe ser en el futuro",
            },
        },
        presenter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "El presentador es obligatorio"],
            validate: {
                validator: async function (v) {
                    const user = await mongoose.model("User").findById(v);
                    return user && user.role === "presenter";
                },
                message: "El presentador debe ser un usuario con rol de 'presenter'",
            },
        },
        location: {
            type: String,
            required: function () {
                return this.modality === "in-person" || this.modality === "hybrid";
            },
            trim: true,
        },
        link: {
            type: String,
            required: function () {
                return this.modality === "online" || this.modality === "hybrid";
            },
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^https?:\/\/.+/.test(v);
                },
                message: "El enlace debe ser una URL válida",
            },
        },
        requirements: {
            type: [String],
            default: [],
        },
        type: {
            type: String,
            enum: ["workshop", "seminar", "conference"],
            required: [true, "El tipo de evento es obligatorio"],
        },
    },
    {
        timestamps: true,
    }
);

export const Event = mongoose.model("Event", eventSchema);
