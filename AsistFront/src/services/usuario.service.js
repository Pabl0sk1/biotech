import axios from 'axios';

const API_BASE_URL = `http://${window.location.hostname}:8082/api/usuario`;

export const getUsuario = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const usuarioListado = result.data.list;
    return usuarioListado;
}

export const getUsuarioPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const usuario = result.data.list;
    return usuario;
}

export const saveUsuario = async (usuario) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, usuario);
    const usuarioGuardado = response.data.added;
    return usuarioGuardado;
}

export const updateUsuario = async (id, usuario) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, usuario);
    const usuarioActualizado = response.data.list;
    return usuarioActualizado;
}

export const deleteUsuario = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const usuarioEliminado = response.data.list;
    return usuarioEliminado;
}

export const getUsuarioPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            usuarios: result.list.content,
            totalPages: result.list.totalPages,
            totalElements: result.list.totalElements,
            size: result.size,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener usuarios paginados:', error);
        throw error;
    }
};

export const getUsuarioPorNombre = async (nombreusuario, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorNombre`, {
            params: {
                nombreusuario,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            usuarios: result.list, // Lista de usuarios de la página actual
            size: result.size, // Total de usuarios encontrados
            totalPages: result.totalPages, // Total de páginas
            currentPage: page, // Página actual
        };
    } catch (error) {
        console.error('Error al buscar usuarios por nombre:', error);
        throw error;
    }
};

export const getUsuarioPorEstado = async (estado, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorEstado`, {
            params: {
                estado,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            usuarios: result.list, // Lista de usuarios de la página actual
            size: result.size, // Tamaño de la página
            totalElements: result.totalElements, // Total de elementos
            totalPages: result.totalPages, // Total de páginas
            currentPage: page, // Página actual
        };
    } catch (error) {
        console.error('Error al buscar usuarios por estado:', error);
        throw error;
    }
};

export const getUsuarioPorNombreYEstado = async (nombreusuario, estado, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorNombreYEstado`, {
            params: {
                nombreusuario,
                estado,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            usuarios: result.list, // Lista de usuarios de la página actual
            size: result.size, // Total de usuarios encontrados
            totalPages: result.totalPages, // Total de páginas
            currentPage: page, // Página actual
        };
    } catch (error) {
        console.error('Error al buscar usuarios por nombre y estado:', error);
        throw error;
    }
};

export const getUsuarioPorIdRol = async (id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorIdRol`, {
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
            usuarios: result.list, // Lista de usuarios de la página actual
            size: result.size, // Total de usuarios encontrados
            totalPages: result.totalPages, // Total de páginas
            currentPage: page, // Página actual
        };
    } catch (error) {
        console.error('Error al buscar usuarios por ID de rol:', error);
        throw error;
    }
};

export const getUsuarioPorNombreYIdRol = async (nombreusuario, id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorNombreYIdRol`, {
            params: {
                nombreusuario,
                id,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            usuarios: result.list, // Lista de usuarios de la página actual
            size: result.size, // Total de usuarios encontrados
            totalPages: result.totalPages, // Total de páginas
            currentPage: page, // Página actual
        };
    } catch (error) {
        console.error('Error al buscar usuarios por nombre y ID de rol:', error);
        throw error;
    }
};

export const getUsuarioPorIdRolYEstado = async (id, estado, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorIdRolYEstado`, {
            params: {
                id,
                estado,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            usuarios: result.list, // Lista de usuarios de la página actual
            size: result.size, // Total de usuarios encontrados
            totalPages: result.totalPages, // Total de páginas
            currentPage: page, // Página actual
        };
    } catch (error) {
        console.error('Error al buscar usuarios por ID de rol y estado:', error);
        throw error;
    }
};

export const getUsuarioPorNombreYEstadoYIdRol = async (nombreusuario, estado, id, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorNombreYIdRolYEstado`, {
            params: {
                nombreusuario,
                estado,
                id,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            usuarios: result.list, // Lista de usuarios de la página actual
            size: result.size, // Total de usuarios encontrados
            totalPages: result.totalPages, // Total de páginas
            currentPage: page, // Página actual
        };
    } catch (error) {
        console.error('Error al buscar usuarios por nombre, estado y ID de rol:', error);
        throw error;
    }
};

export const loginUsuario = async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
}

export const cambiarContrasena = async (userId, passwordData) => {
    const response = await axios.post(`${API_BASE_URL}/cambiarContrasena/${userId}`, passwordData);
    return response.data;
}
