import axios from 'axios'

const API_BASE_URL = `http://${window.location.hostname}:8082/api/cargo`;

export const getCargo = async () => {
    const result = await axios.get(`${API_BASE_URL}/listar`);
    const cargoListado = result.data.list;
    return cargoListado;
}

export const getCargoPorId = async (id) => {
    const result = await axios.get(`${API_BASE_URL}/buscarPorId/${id}`);
    const cargo = result.data.list;
    return cargo;
}

export const saveCargo = async (cargo) => {
    const response = await axios.post(`${API_BASE_URL}/guardar`, cargo);
    const cargoGuardado = response.data.added;
    return cargoGuardado;
}

export const updateCargo = async (id, cargo) => {
    const response = await axios.put(`${API_BASE_URL}/modificar/${id}`, cargo);
    const cargoActualizado = response.data.list;
    return cargoActualizado;
}

export const deleteCargo = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/eliminar/${id}`);
    const cargoEliminado = response.data.list;
    return cargoEliminado;
}

export const getCargoPaginado = async (page = 0, size = 10, sortBy = 'id', sortType = false) => {
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
            cargos: result.list.content,
            totalPages: result.list.totalPages,
            totalElements: result.list.totalElements,
            size: result.size,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al obtener cargos paginados:', error);
        throw error;
    }
};

export const getCargoPorDesc = async (cargo, page = 0, size = 10, sortBy = 'id', sortType = false) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/buscarPorCargoDesc`, {
            params: {
                cargo,
                page,
                size,
                sortBy,
                sortType,
            },
        });

        const result = response.data;
        return {
            cargos: result.list,
            size: result.size,
            totalPages: result.totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error al buscar cargos por descripción:', error);
        throw error;
    }
};
