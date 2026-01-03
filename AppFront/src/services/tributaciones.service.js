import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/taxation`;

export const getTaxation = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveTaxation = async (taxation) => {
    const response = await axios.post(`${API_BASE_URL}/save`, taxation);
    return response.data;
}

export const updateTaxation = async (id, taxation) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, taxation);
    return response.data;
}

export const deleteTaxation = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpTaxation = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
