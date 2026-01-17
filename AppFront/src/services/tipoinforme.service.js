import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/reporttype`;

export const getReportType = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const saveReportType = async (reporttype) => {
    const response = await axios.post(`${API_BASE_URL}/save`, reporttype);
    return response.data;
}

export const updateReportType = async (id, reporttype) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, reporttype);
    return response.data;
}

export const deleteReportType = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}
