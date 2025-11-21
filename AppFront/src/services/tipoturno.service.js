import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `http://${dir}/api/tipoturno`;

export const getTipoTurno = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const tipoturnoListado = result.data.list;
    return tipoturnoListado;
}

export const getTipoTurnoPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const tipoturno = result.data.list;
    return tipoturno;
}

export const saveTipoTurno = async (tipoturno) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, tipoturno);
    const tipoturnoGuardado = response.data.added;
    return tipoturnoGuardado;
}

export const updateTipoTurno = async (id, tipoturno) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, tipoturno);
    const tipoturnoActualizado = response.data.list;
    return tipoturnoActualizado;
}

export const deleteTipoTurno = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const tipoturnoEliminado = response.data.list;
    return tipoturnoEliminado;
}

export const getTipoTurnoPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            tipoturnos: result.list.content,
            totalPages: result.list.totalPages,
            totalElements: result.list.totalElements,
            size: result.size,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener tipo de turnos paginados:', error);
        throw error;
    }
};

export const getTipoPorDesc = async (tipo, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorTipoDesc`, {
            params: {
                tipo,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            tipoturnos: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar tipos de turnos por descripción:', error);
        throw error;
    }
};
