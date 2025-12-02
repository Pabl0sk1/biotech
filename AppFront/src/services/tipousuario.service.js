import axios from 'axios';
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/role`;

export const getRole = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
};

export const saveRole = async (role) => {
    const response = await axios.post(`${API_BASE_URL}/save`, role);
    return response.data;
};

export const updateRole = async (id, role) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, role);
    return response.data;
};

export const deleteRole = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
};
