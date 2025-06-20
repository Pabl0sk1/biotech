import axios from 'axios'

const API_BASE_URL = `http://${window.location.hostname}:8082/api/tipousuario`;

export const getTipoUsuario = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const tipousuarioListado = result.data.list;
    return tipousuarioListado;
}

export const getTipoUsuarioPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const tipousuario = result.data.list;
    return tipousuario;
}

export const saveTipoUsuario = async (tipousuario) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, tipousuario);
    const tipousuarioGuardado = response.data.added;
    return tipousuarioGuardado;
}

export const updateTipoUsuario = async (id, tipousuario) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, tipousuario);
    const tipousuarioActualizado = response.data.list;
    return tipousuarioActualizado;
}

export const deleteTipoUsuario = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const tipousuarioEliminado = response.data.list;
    return tipousuarioEliminado;
}

export const getTipoUsuarioPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            tipousuarios: result.list.content,
            totalPages: result.list.totalPages,
            totalElements: result.list.totalElements,
            size: result.size,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener tipo de usuarios paginados:', error);
        throw error;
    }
};

export const getTipoUsuarioPorDesc = async (tipousuario, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorTipoUsuarioDesc`, {
            params: {
                tipousuario,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            tipousuarios: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar tipos de usuarios por nombre:', error);
        throw error;
    }
};
