import axios from 'axios'

const API_BASE_URL = `http://${window.location.hostname}:8082/api/turno`;

export const getTurno = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const turnoListado = result.data.list;
    return turnoListado;
}

export const getTurnoPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const turno = result.data.list;
    return turno;
}

export const saveTurno = async (turno) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, turno);
    const turnoGuardada = response.data.added;
    return turnoGuardada;
};

export const updateTurno = async (id, turno) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, turno);
    const turnoActualizado = response.data.modified;
    return turnoActualizado;
};

export const deleteTurno = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const turnoEliminado = response.data.deleted;
    return turnoEliminado;
};

export const getTurnoDetalle = async () => {
    const result = await axios.get(`${API_BASE_URL}/listarDetalle`);
    const turnoDetalleListado = result.data.list;
    return turnoDetalleListado;
}

export const getTurnoDetallePorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorIdDetalle/${id}`);
    const turnoDetalle = result.data.list;
    return turnoDetalle;
}

export const deleteTurnoDetalle = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/eliminarDetalle/${id}`);
        if (response.data.ok) {
            return response.data.deleted;
        } else {
            throw new Error(response.data.message || 'Error al eliminar el detalle');
        }
    } catch (error) {
        console.error('Error eliminando detalle de turno:', error);
        throw error;
    }
};

export const getTurnoPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/listarPaginado`, {
        params: { page, size, sortBy, sortType }
    });
    return {
        turnos: response.data.list.content,
        totalPages: response.data.list.totalPages,
        currentPage: page
    };
};

export const getTurnoPorTipo = async (id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorIdTipo`, {
            params: {
                id,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            turnos: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar turnos por tipo:', error);
        throw error;
    }
};
