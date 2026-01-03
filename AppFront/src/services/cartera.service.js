import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/wallet`;

export const getWallet = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveWallet = async (wallet) => {
    const response = await axios.post(`${API_BASE_URL}/save`, wallet);
    return response.data;
}

export const updateWallet = async (id, wallet) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, wallet);
    return response.data;
}

export const deleteWallet = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpWallet = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
