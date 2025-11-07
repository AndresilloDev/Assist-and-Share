import { User } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const AuthService = {
    login: async (email, password) => {
        try {
            const user = await User.findOne({email})
            if (!user) throw ApiError.notFound("Usuario no encontrado");

            const isMatch = await user.matchPassword(password);
            if (!isMatch) throw ApiError.unauthorized("Contraseña incorrecta");

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            })

            const userData = user.toObject();
            delete userData.password;

            return { user: userData, token };
        } catch (error) {
            if (error instanceof ApiError) throw error;

            if (process.env.DEBUG == "true") {
                console.error("Error en AuthService.login:", error);
            }
            throw ApiError.internal("Error al iniciar sesión");
        }
    },

    register: async (userData) => {
        try {
            const { email, password, first_name, last_name, role, speciality } = userData;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw ApiError.badRequest("El correo ya está registrado");
            }

            const newUser = new User({
                email,
                password,
                first_name,
                last_name,
                role,
                speciality,
            });
            await newUser.save();

            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            const userObj = newUser.toObject();
            delete userObj.password;

            return {
                user: userObj,
                token,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;

            console.error("Error en AuthService.register:", error);
            throw ApiError.internal("Error al registrar el usuario");
        }
    },
}