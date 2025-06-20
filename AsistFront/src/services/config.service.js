import axios from 'axios'

const API_BASE_URL = `http://${window.location.hostname}:8082/api/configuracion`;

export const getConfig = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const configListado = result.data.list;
    return configListado;
}

export const getConfigPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const config = result.data.list;
    return config;
}

export const saveConfig = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/guardar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Agrega el encabezado Content-Type
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al guardar la configuración:', error);
        throw error;
    }
}

export const updateConfig = async (id, formData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Agrega el encabezado Content-Type
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la configuración:', error);
        throw error;
    }
}

export const getConfigPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/listarPaginado`, {
            params: {
                page,
                size,
                sortBy,
                sortType,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener la configuración paginada:', error);
        throw error;
    }
};
