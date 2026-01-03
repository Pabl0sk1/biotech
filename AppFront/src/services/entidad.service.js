import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/entity`;

export const getEntity = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveEntity = async (entity) => {
    const response = await axios.post(`${API_BASE_URL}/save`, entity);
    return response.data;
}

export const updateEntity = async (id, entity) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, entity);
    return response.data;
}

export const deleteEntity = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpEntity = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
