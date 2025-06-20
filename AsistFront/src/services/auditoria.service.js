import axios from 'axios'

const API_BASE_URL = `http://${window.location.hostname}:8082/api/auditoria`;

export const getAuditoria = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const auditoriaListado = result.data.list;
    return auditoriaListado;
}

export const getAuditoriaPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const auditoria = result.data.list;
    return auditoria;
}

export const getNetworkInfo = async () => {
    const result = await axios.get(`${API_BASE_URL}/networkInfo`);
    const networkInfo = result.data;
    return networkInfo;
}

export const saveAuditoria = async (auditoria) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, auditoria);
    const auditoriaGuardado = response.data.added;
    return auditoriaGuardado;
}

export const updateAuditoria = async (id, auditoria) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, auditoria);
    const auditoriaActualizado = response.data.list;
    return auditoriaActualizado;
}

export const deleteAuditoria = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const auditoriaEliminado = response.data.list;
    return auditoriaEliminado;
}

export const getAuditoriaPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/listarPaginado`, {
            params: {
                page,
                size,
                sortBy,
                sortType,
            },
        });
        const result = response.data;
        return {
            auditorias: result.list.content,
            totalPages: result.list.totalPages,
            totalElements: result.list.totalElements,
            size: result.size,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener auditorias paginadas:', error);
        throw error;
    }
};

export const getAuditoriaPorIdUsuario = async (id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorIdUsuario`, {
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
            auditorias: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar auditoria por usuario:', error);
        throw error;
    }
};

export const getAuditoriaPorUsuario = async (usuario, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorUsuario`, {
            params: {
                usuario,
                page,
                size,
                sortBy,
                sortType,
            },
        });
        const result = response.data;
        return {
            auditorias: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar auditoria por usuario:', error);
        throw error;
    }
};

export const getAuditoriaPorOperacion = async (operacion, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorOperacion`, {
            params: {
                operacion,
                page,
                size,
                sortBy,
                sortType,
            },
        });
        const result = response.data;
        return {
            auditorias: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar auditoria por operacion:', error);
        throw error;
    }
};

export const getAuditoriaPorIdUsuarioYOperacion = async (id, operacion, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorIdUsuarioYOperacion`, {
            params: {
                id,
                operacion,
                page,
                size,
                sortBy,
                sortType,
            },
        });
        const result = response.data;
        return {
            auditorias: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar auditoria por usuario y operacion:', error);
        throw error;
    }
};

export const getAuditoriaPorUsuarioYOperacion = async (usuario, operacion, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorUsuarioYOperacion`, {
            params: {
                usuario,
                operacion,
                page,
                size,
                sortBy,
                sortType,
            },
        });
        const result = response.data;
        return {
            auditorias: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar auditoria por usuario y operacion:', error);
        throw error;
    }
};
