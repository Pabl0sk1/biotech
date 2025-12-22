import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/commercial`;

export const getCommercial = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveCommercial = async (commercial) => {
    const response = await axios.post(`${API_BASE_URL}/save`, commercial);
    return response.data;
}

export const updateCommercial = async (id, commercial) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, commercial);
    return response.data;
}

export const deleteCommercial = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
