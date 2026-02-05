import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/menu`;

export const getMenu = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveMenu = async (menu) => {
    const response = await axios.post(`${API_BASE_URL}/save`, menu);
    return response.data;
};

export const updateMenu = async (id, menu) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, menu);
    return response.data;
};

export const deleteMenu = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
};

export const deleteSubMenu = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteSubmenu/${id}`);
    return response.data;
};

export const deleteProgram = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteProgram/${id}`);
    return response.data;
};
