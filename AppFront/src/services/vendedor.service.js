import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = await HostLocation();

// Ruta base
const API_BASE_URL = `http://${dir}/api/vendedor`;

export const getVendedor = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const vendedorListado = result.data.list;
    return vendedorListado;
}

export const getVendedorPorNombreONrodoc = async (q) => {
    const result = await axios.get(`${API_BASE_URL}/listarPorNombreONrodoc`, {
        params: { q },
    });
    const vendedorListado = result.data.list;
    return vendedorListado;
};

export const getVendedorPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const vendedor = result.data.list;
    return vendedor;
}

export const saveVendedor = async (vendedor) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, vendedor);
    const vendedorGuardado = response.data.added;
    return vendedorGuardado;
}

export const updateVendedor = async (id, vendedor) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, vendedor);
    const vendedorActualizado = response.data.list;
    return vendedorActualizado;
}

export const deleteVendedor = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const vendedorEliminado = response.data.list;
    return vendedorEliminado;
}

export const getVendedorPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            vendedores: result.list.content,
            totalPages: result.list.totalPages,
            totalElements: result.list.totalElements,
            size: result.size,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener vendedores paginados:', error);
        throw error;
    }
};

export const getVendedorPorNrodoc = async (nrodoc, page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            vendedores: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar vendedores por número de documento:', error);
        throw error;
    }
};

export const getVendedorPorNombre = async (nombre, page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            vendedores: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar vendedores por nombre:', error);
        throw error;
    }
};

export const getVendedorPorNrodocYNombre = async (nrodoc, nombre, page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            vendedores: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar vendedores por número de documento y nombre:', error);
        throw error;
    }
};
