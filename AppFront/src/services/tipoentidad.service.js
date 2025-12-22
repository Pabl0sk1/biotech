import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/entitytype`;

export const getEntityType = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveEntityType = async (entitytype) => {
    const response = await axios.post(`${API_BASE_URL}/save`, entitytype);
    return response.data;
}

export const updateEntityType = async (id, entitytype) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, entitytype);
    return response.data;
}

export const deleteEntityType = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
