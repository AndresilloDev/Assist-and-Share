import { User } from "../../models/user.model.js";
import { Event } from "../../models/event.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { buildQuery } from "../../utils/queryBuilder.js";

export const UserService = {
    getAllUsers: async (queryOptions) => {
        return await buildQuery(User, queryOptions);
    },

    getUserById: async (userId) => {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw ApiError.notFound("Usuario no encontrado");
            }

            return user;
        } catch (error) {
            throw ApiError.internal("Error al obtener el usuario");
        }
    },

    updateUser: async (userId, data) => {
        const disallowed = ["_id", "password"];
        disallowed.forEach(field => delete data[field]);

        return await User.findByIdAndUpdate(userId, data, {
            new: true,
            runValidators: true,
        }).select("-password");
    },

    deleteUser: async (userId) => {
        const deleted = await User.findByIdAndDelete(userId);
        return !!deleted;
    },

    updateCurrentPassword: async (userId, currentPassword, newPassword) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw ApiError.notFound("Usuario no encontrado");
            }
    
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                throw ApiError.badRequest("La contraseña actual es incorrecta");
            }
    
            user.password = newPassword;
            await user.save();
            return user;
        } catch (error) {
            throw ApiError.internal("Error al actualizar la contraseña");
        }
    },

    getUserEvents: async (userId) => {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw ApiError.notFound("Usuario no encontrado");
            }

            const events = await Event.find({ participants: userId });
            return events;
        } catch (error) {
            throw ApiError.internal("Error al obtener los eventos del usuario");
        }
    }
};
