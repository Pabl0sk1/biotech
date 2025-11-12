import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8082/api/tipousuario`;

export const getTipoUsuario = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    return result.data.list;
};

export const getTipoUsuarioPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    return result.data.list;
};

export const saveTipoUsuario = async (tipousuario) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, tipousuario);
    return response.data.added;
};

export const updateTipoUsuario = async (id, tipousuario) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, tipousuario);
    return response.data.modified; // Cambié de list a modified
};

export const deleteTipoUsuario = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    return response.data.deleted; // Cambié de list a deleted
};

export const getTipoUsuarioPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/listarPaginado`, {
        params: { page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        tipousuarios: result.list,
        totalElements: result.size,
        currentPage: page,
    };
};

export const getTipoUsuarioPorDesc = async (tipousuario, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorTipoUsuarioDesc`, {
        params: { tipousuario, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        tipousuarios: result.list,
        totalElements: result.size,
        totalPages: result.totalPages,
        currentPage: page,
    };
};
