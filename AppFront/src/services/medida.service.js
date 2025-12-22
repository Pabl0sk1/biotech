import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/measure`;

export const getMeasure = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveMeasure = async (measure) => {
    const response = await axios.post(`${API_BASE_URL}/save`, measure);
    return response.data;
}

export const updateMeasure = async (id, measure) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, measure);
    return response.data;
}

export const deleteMeasure = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
