
export const obtenerClaseEstadoReg = (activo) => {
    return activo
        ? 'badge-activo'
        : 'badge-inactivo';
};

export const obtenerClaseEstadoInf = (estado) => {
    return estado == 'Aprobado'
        ? 'badge-activo'
        : 'badge-inactivo';
};
