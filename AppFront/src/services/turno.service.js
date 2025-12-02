import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/shift`;

export const getShift = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveShift = async (shift) => {
    const response = await axios.post(`${API_BASE_URL}/save`, shift);
    return response.data;
};

export const updateShift = async (id, shift) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, shift);
    return response.data;
};

export const deleteShift = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
};

export const deleteShiftDay = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteDay/${id}`);
    return response.data;
};
