import axios from 'axios';
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = await HostLocation();

// Ruta base
const API_BASE_URL = `http://${dir}/api/usuario`;

// CRUD Básico
export const getUsuario = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    return result.data.list;
};

export const getUsuarioPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    return result.data.list;
};

export const saveUsuario = async (usuario) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, usuario);
    return response.data.added;
};

export const updateUsuario = async (id, usuario) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, usuario);
    return response.data.modified;
};

export const deleteUsuario = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    return response.data.deleted;
};

// Paginación
export const getUsuarioPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/listarPaginado`, {
        params: { page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list.content,
        totalPages: result.list.totalPages,
        totalElements: result.list.totalElements,
        size: result.size,
        currentPage: page,
    };
};

// Búsquedas por nombre, estado y rol
export const getUsuarioPorNombre = async (nombreusuario, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorNombre`, {
        params: { nombreusuario, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list,
        size: result.size,
        totalPages: result.totalPages,
        currentPage: page,
    };
};

export const getUsuarioPorEstado = async (estado, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorEstado`, {
        params: { estado, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        currentPage: page,
    };
};

export const getUsuarioPorNombreYEstado = async (nombreusuario, estado, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorNombreYEstado`, {
        params: { nombreusuario, estado, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list,
        size: result.size,
        totalPages: result.totalPages,
        currentPage: page,
    };
};

export const getUsuarioPorIdRol = async (id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorIdRol`, {
        params: { id, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list,
        size: result.size,
        totalPages: result.totalPages,
        currentPage: page,
    };
};

export const getUsuarioPorNombreYIdRol = async (nombreusuario, id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorNombreYIdRol`, {
        params: { nombreusuario, id, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list,
        size: result.size,
        totalPages: result.totalPages,
        currentPage: page,
    };
};

export const getUsuarioPorIdRolYEstado = async (id, estado, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorIdRolYEstado`, {
        params: { id, estado, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list,
        size: result.size,
        totalPages: result.totalPages,
        currentPage: page,
    };
};

export const getUsuarioPorNombreYEstadoYIdRol = async (nombreusuario, estado, id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    const response = await axios.get(`${API_BASE_URL}/buscarPorNombreYIdRolYEstado`, {
        params: { nombreusuario, estado, id, page, size, sortBy, sortType },
    });
    const result = response.data;
    return {
        usuarios: result.list,
        size: result.size,
        totalPages: result.totalPages,
        currentPage: page,
    };
};

// Login y cambio de contraseña
export const loginUsuario = async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
};

export const cambiarContrasena = async (userId, passwordData) => {
    const response = await axios.post(`${API_BASE_URL}/cambiarContrasena/${userId}`, passwordData);
    return response.data;
};
