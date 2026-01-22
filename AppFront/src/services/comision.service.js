import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/commission`;

export const getCommission = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveCommission = async (commission) => {
    const response = await axios.post(`${API_BASE_URL}/save`, commission);
    return response.data;
};

export const updateCommission = async (id, commission) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, commission);
    return response.data;
};

export const deleteCommission = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
};

export const deleteCommissionHarvest = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteHarvest/${id}`);
    return response.data;
};

export const updateErpCommission = async () => {
    const response = await axios.post(`${API_BASE_URL}/updateErp`);
    return response.data;
}
