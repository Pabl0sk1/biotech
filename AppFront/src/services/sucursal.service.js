import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/branch`;

export const getBranch = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveBranch = async (branch) => {
    const response = await axios.post(`${API_BASE_URL}/save`, branch);
    return response.data;
}

export const updateBranch = async (id, branch) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, branch);
    return response.data;
}

export const deleteBranch = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const updateErpBranch = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
