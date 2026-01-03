import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/position`;

export const getPosition = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const savePosition = async (position) => {
    const response = await axios.post(`${API_BASE_URL}/save`, position);
    return response.data;
}

export const updatePosition = async (id, position) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, position);
    return response.data;
}

export const deletePosition = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpPosition = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
