
export const obtenerClaseEstadoReg = (activo) => {
    return activo
        ? 'badge bg-success text-white rounded-pill px-3 py-1'
        : 'badge bg-danger text-white rounded-pill px-3 py-1';
};

export const obtenerClaseEstadoInf = (estado) => {
    return estado == 'Aprobado'
        ? 'badge bg-success text-white rounded-pill px-3 py-1'
        : 'badge bg-danger text-white rounded-pill px-3 py-1';
};
