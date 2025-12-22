import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/product`;

export const getProduct = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveProduct = async (product) => {
    const response = await axios.post(`${API_BASE_URL}/save`, product);
    return response.data;
}

export const updateProduct = async (id, product) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, product);
    return response.data;
}

export const deleteProduct = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
