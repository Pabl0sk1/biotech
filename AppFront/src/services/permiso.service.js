import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/permission`;

export const getPermission = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const savePermission = async (permission) => {
    const response = await axios.post(`${API_BASE_URL}/save`, permission);
    return response.data;
}

export const updatePermission = async (id, permission) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, permission);
    return response.data;
}

export const deletePermission = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
