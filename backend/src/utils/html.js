export const updateEventHtml = (event) => {
    return `
        <h2>Actualización del evento: <strong>${event.title}</strong></h2>
        <p>Queremos informarte que uno de los eventos al que estás inscrito ha sido actualizado. Te compartimos los detalles más recientes:</p>

        <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString()}</p>
        <p><strong>Duración:</strong> ${event.duration} minutos</p>
        <p><strong>Modalidad:</strong> ${event.modality}</p>
        <p><strong>Tipo de evento:</strong> ${event.type}</p>
        ${event.location ? `<p><strong>Ubicación:</strong> ${event.location}</p>` : ""}
        ${event.link ? `<p><strong>Enlace de acceso:</strong> ${event.link}</p>` : ""}

        ${event.description ? `<p><strong>Descripción:</strong> ${event.description}</p>` : ""}

        <p style="margin-top: 20px;">
            Te recomendamos ingresar a la plataforma para revisar todos los cambios y asegurarte de tener la información más reciente.
        </p>
    `;
};

export const deleteEventHtml = (event) => {
    return `
        <h2>El evento <strong>${event.title}</strong> ha sido cancelado</h2>
        <p>Lamentamos informarte que el evento al que estabas inscrito ha sido eliminado de la plataforma.</p>

        <p><strong>Tipo de evento:</strong> ${event.type}</p>
        <p><strong>Fecha programada originalmente:</strong> ${new Date(event.date).toLocaleString()}</p>

        <p style="margin-top: 20px;">
            Te invitamos a revisar la plataforma para explorar otros eventos disponibles que puedan interesarte. 
        </p>
    `;
};

export const startEventHtml = (event) => {
    return `
        <h2>¡El evento ha comenzado! <br><strong>${event.title}</strong></h2>

        <p>El evento al que te inscribiste ya está en curso. A continuación te dejamos la información que necesitas para unirte:</p>

        <p><strong>Modalidad:</strong> ${event.modality}</p>
        ${event.location ? `<p><strong>Ubicación:</strong> ${event.location}</p>` : ""}
        ${event.link ? `<p><strong>Acceso:</strong> ${event.link}</p>` : ""}

        <p style="margin-top: 20px;">¡Te esperamos!</p>
    `;
};

export const completeEventHtml = (event) => {
    return `
        <h2>El evento ha finalizado: <strong>${event.title}</strong></h2>

        <p>Gracias por haber formado parte de este evento. A continuación te dejamos un resumen:</p>

        <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString()}</p>
        <p><strong>Duración:</strong> ${event.duration} minutos</p>
        <p><strong>Modalidad:</strong> ${event.modality}</p>

        <p style="margin-top: 20px;">
            Puedes ingresar a la plataforma para ver más información o registrarte a nuevos eventos próximos.
        </p>
    `;
};
