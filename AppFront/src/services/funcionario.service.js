import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/employee`;

export const getEmployee = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveEmployee = async (employee) => {
    const response = await axios.post(`${API_BASE_URL}/save`, employee);
    return response.data;
}

export const updateEmployee = async (id, employee) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, employee);
    return response.data;
}

export const deleteEmployee = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
