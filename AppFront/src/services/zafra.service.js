import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/harvest`;

export const getHarvest = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveHarvest = async (harvest) => {
    const response = await axios.post(`${API_BASE_URL}/save`, harvest);
    return response.data;
}

export const updateHarvest = async (id, harvest) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, harvest);
    return response.data;
}

export const deleteHarvest = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpHarvest = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
