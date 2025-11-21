import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `http://${dir}/api/token`;

export const getToken = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const tokenListado = result.data.list;
    return tokenListado;
}

export const getTokenPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const token = result.data.list;
    return token;
}

export const saveToken = async (id) => {
    const response = await axios.post(`${API_BASE_URL}/guardar/${id}`);
    const tokenGuardada = response.data.added;
    return tokenGuardada;
};

export const updateToken = async (id) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`);
    const tokenGuardada = response.data.modified;
    return tokenGuardada;
};

export const deleteToken = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const tokenEliminado = response.data.deleted;
    return tokenEliminado;
};

export const getTokenPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/listarPaginado`, {
        params: { page, size, sortBy, sortType }
    });
    const result = response.data;
    return {
        tokens: result.list,
        size: result.size,
        totalPages: result.list.totalPages,
        currentPage: page
    };
};

export const getTokenPorUsuario = async (usuario, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorUsuario`, {
            params: { usuario, page, size, sortBy, sortType },
        });

        const result = response.data;
        return {
            tokens: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page
        };
    } catch (error) {
        console.error('Error al buscar tokens por usuario:', error);
        throw error;
    }
};
