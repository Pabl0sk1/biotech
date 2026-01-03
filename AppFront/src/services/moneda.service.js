import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/currency`;

export const getCurrency = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveCurrency = async (currency) => {
    const response = await axios.post(`${API_BASE_URL}/save`, currency);
    return response.data;
}

export const updateCurrency = async (id, currency) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, currency);
    return response.data;
}

export const deleteCurrency = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpCurrency = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
