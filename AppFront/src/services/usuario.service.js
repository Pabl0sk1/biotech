import axios from 'axios';
import { HostLocation } from '../utils/HostLocation';

// Obtener dirección del host
const dir = HostLocation();

// Ruta base
const API_BASE_URL = `${dir}/user`;

export const getUser = async (page, size, order, filter, detail) => {
    const response = await axios.get(`${API_BASE_URL}/list`, {
        params: { page, size, order, filter, detail },
    });
    return response.data;
};

export const saveUser = async (user) => {
    const response = await axios.post(`${API_BASE_URL}/save`, user);
    return response.data;
};

export const updateUser = async (id, user) => {
    const response = await axios.put(`${API_BASE_URL}/update/${id}`, user);
    return response.data;
};

export const updateUserImage = async (id, user) => {
    const response = await axios.put(`${API_BASE_URL}/updateImage/${id}`, user, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
    return response.data;
};

export const deleteUserImage = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteImage/${id}`);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
};

export const changePassword = async (id, credentials) => {
    const response = await axios.post(`${API_BASE_URL}/changePassword/${id}`, credentials);
    return response.data;
};
