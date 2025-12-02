import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/seller`;

export const getSeller = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveSeller = async (seller) => {
    const response = await axios.post(`${API_BASE_URL}/save`, seller);
    return response.data;
}

export const updateSeller = async (id, seller) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, seller);
    return response.data;
}

export const deleteSeller = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
