import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: process.env.EMAIL_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (options) => {

    //ESTA MADRE FALLA, CULPA DE CESAR, LO COMENTO PA QUE NO TRUENE EL FRON AL QUERER BORRAR UN EVENTO DONDE HAY UN USUARIO ASISTIENDO

    if ((!options.to && !options.bcc) || !options.subject || (!options.text && !options.html)) {
        throw new Error("Faltan campos requeridos para enviar el correo");
    }

    const mailOptions = {
        from: `"Assist and Share" <${process.env.EMAIL_USER}>`,
        ...options,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a: ${options.to}`);
    } catch (error) {
        console.error("Error al enviar correo:", error);
        throw error;
    }
};
