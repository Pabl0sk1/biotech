import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/crop`;

export const getCrop = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveCrop = async (crop) => {
    const response = await axios.post(`${API_BASE_URL}/save`, crop);
    return response.data;
}

export const updateCrop = async (id, crop) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, crop);
    return response.data;
}

export const deleteCrop = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpCrop = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
