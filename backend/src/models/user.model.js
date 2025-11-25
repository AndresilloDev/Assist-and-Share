import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Debe ser un correo electrónico válido"],
    },
    first_name: {
        type: String,
        trim: true,
        required: [true, "El nombre es obligatorio"],
    },
    last_name: {
        type: String,
        trim: true,
        required: [true, "El apellido es obligatorio"],
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    role: {
        type: String,
        enum: ["attendee", "presenter", "admin"],
        default: "attendee",
        required: true,
    },
    speciality: {
        type: String,
    },
    googleId: {
        type: String,
    },
    deleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.logicalDelete = async function () {
    this.deleted = true;
    await this.save();
    return this;
}

export const User = mongoose.model("User", userSchema);
