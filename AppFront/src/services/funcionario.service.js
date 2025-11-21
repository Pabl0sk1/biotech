import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `http://${dir}/api/funcionario`;

export const getFuncionario = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const funcionarioListado = result.data.list;
    return funcionarioListado;
}

export const getFuncionarioPorNombreONrodoc = async (q) => {
    const result = await axios.get(`${API_BASE_URL}/listarPorNombreONrodoc`, {
        params: { q },
    });
    const funcionarioListado = result.data.list;
    return funcionarioListado;
};

export const getFuncionarioPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const funcionario = result.data.list;
    return funcionario;
}

export const saveFuncionario = async (funcionario) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, funcionario);
    const funcionarioGuardado = response.data.added;
    return funcionarioGuardado;
}

export const updateFuncionario = async (id, funcionario) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, funcionario);
    const funcionarioActualizado = response.data.list;
    return funcionarioActualizado;
}

export const deleteFuncionario = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const funcionarioEliminado = response.data.list;
    return funcionarioEliminado;
}

export const getFuncionarioPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            funcionarios: result.list.content,
            totalPages: result.list.totalPages,
            totalElements: result.list.totalElements,
            size: result.size,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener funcionarios paginados:', error);
        throw error;
    }
};

export const getFuncionarioPorNrodoc = async (nrodoc, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorNrodoc`, {
            params: {
                nrodoc,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            funcionarios: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar funcionarios por número de documento:', error);
        throw error;
    }
};

export const getFuncionarioPorNombre = async (nombre, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorNombre`, {
            params: {
                nombre,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            funcionarios: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar funcionarios por nombre:', error);
        throw error;
    }
};

export const getFuncionarioPorNrodocYNombre = async (nrodoc, nombre, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorNrodocYNombre`, {
            params: {
                nrodoc,
                nombre,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            funcionarios: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar funcionarios por número de documento y nombre:', error);
        throw error;
    }
};
