import { saveAccess, getNetworkInfo } from '../services/auditoria.service.js';

export const obtenerFechaHora = () => {
    const localDate = new Date();

    const dia = String(localDate.getDate()).padStart(2, '0');
    const mes = String(localDate.getMonth()).padStart(2, '0');
    const anio = localDate.getFullYear();
    const hora = String(localDate.getHours() - 3).padStart(2, '0');
    const minuto = String(localDate.getMinutes()).padStart(2, '0');

    return {
        fechahora: new Date(anio, mes, dia, hora, minuto),
        fecha: new Date(anio, mes, dia)
    };
};

const recuperarNetworkInfo = async () => {
    const response = await getNetworkInfo();
    return response;
}

export const AddAccess = async (op, cod, userLog, module) => {
    const network = await recuperarNetworkInfo();
    const data = obtenerFechaHora();
    const access = {
        id: null,
        usuario: {
            id: userLog?.id
        },
        fechahora: data.fechahora,
        fecha: data.fecha,
        programa: module,
        operacion: op,
        codregistro: cod,
        ip: network.ip,
        equipo: network.equipo
    }
    await saveAccess(access);
}
