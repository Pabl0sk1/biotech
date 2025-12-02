
export const DateHourFormat = (dateHour, op) => {
    if (!dateHour) return '';
    const date = new Date(dateHour);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    if (op == 1) return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
    else return `${dia}/${mes}/${anio}`;
}

export const HourFormat = (hour) => {
    if (hour instanceof Date) return hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    else if (typeof hour === "string" && hour.includes(":")) return hour.slice(0, 5);
    return hour;
}