import axios from 'axios'
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/report`;

export const getReport = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
}

export const getReportData = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/data/${id}`);
    return response.data;
}

export const saveReportData = async (id, data) => {
    const response = await axios.post(`${API_BASE_URL}/saveData/${id}`, data, {
        headers: { "Content-Type": "application/json" }
    });
    return response.data;
}

export const saveReport = async (report) => {
    const response = await axios.post(`${API_BASE_URL}/save`, report);
    return response.data;
}

export const updateReport = async (id, report) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, report);
    return response.data;
}

export const deleteReport = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
}

export const deleteReportData = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteData/${id}`);
    return response.data;
}
