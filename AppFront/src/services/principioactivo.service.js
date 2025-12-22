import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/asset`;

export const getAsset = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveAsset = async (asset) => {
    const response = await axios.post(`${API_BASE_URL}/save`, asset);
    return response.data;
}

export const updateAsset = async (id, asset) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, asset);
    return response.data;
}

export const deleteAsset = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
