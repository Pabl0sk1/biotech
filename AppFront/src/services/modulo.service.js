import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/module`;

export const getModule = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveModule = async (module) => {
    const response = await axios.post(`${API_BASE_URL}/save`, module);
    return response.data;
}

export const updateModule = async (id, module) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, module);
    return response.data;
}

export const deleteModule = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
