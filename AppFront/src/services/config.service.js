import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8000/api/configuracion`;

// Listado completo
export const getConfig = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    return result.data;
};

// Buscar por ID
export const getConfigPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    return result.data;
};

// Guardar nueva configuración
export const saveConfig = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/guardar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error al guardar la configuración:', error);
        throw error;
    }
};

// Actualizar configuración existente
export const updateConfig = async (id, formData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar la configuración con ID ${id}:`, error);
        throw error;
    }
};

// Paginación
export const getConfigPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/listarPaginado`, {
            params: { page, size, sortBy, sortType },
        });
        const result = response.data;
        return {
            configuraciones: result.list, // lista de objetos
            totalElements: result.size,    // total de elementos
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener la configuración paginada:', error);
        throw error;
    }
};
