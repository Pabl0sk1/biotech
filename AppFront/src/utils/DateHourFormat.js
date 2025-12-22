
export const DateHourFormat = (dateHour, op) => {
    if (!dateHour) return '';

    let date;
    if (op == 1) {
        date = new Date(dateHour);
        if (isNaN(date)) return '';
    } else {
        const [anio, mes, dia] = dateHour.split('-').map(Number);
        date = new Date(anio, mes - 1, dia);
    }


    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');

    if (op == 1) return `${dd}/${mm}/${yyyy} ${hora}:${minuto}`;
    else return `${dd}/${mm}/${yyyy}`;
}

export const HourFormat = (hour) => {
    if (hour instanceof Date) return hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    else if (typeof hour === "string" && hour.includes(":")) return hour.slice(0, 5);
    return hour;
}