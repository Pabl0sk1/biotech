import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/schedule`;

export const getSchedule = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveSchedule = async (schedule) => {
    const response = await axios.post(`${API_BASE_URL}/save`, schedule);
    return response.data;
}

export const updateSchedule = async (id, schedule) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, schedule);
    return response.data;
}

export const deleteSchedule = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
