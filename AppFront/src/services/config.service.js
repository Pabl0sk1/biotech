import axios from 'axios';
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/config`;

export const getConfig = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
};

export const saveConfig = async (config) => {
    const response = await axios.post(`${API_BASE_URL}/save`, config, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const updateConfig = async (id, config) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, config, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const deleteImage = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteImage/${id}`);
    return response.data;
};
