import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/token`;

export const getToken = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveToken = async (id) => {
    const response = await axios.post(`${API_BASE_URL}/save/${id}`);
    return response.data;
};

export const updateToken = async (id, token) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, token);
    return response.data;
};

export const deleteToken = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
};
