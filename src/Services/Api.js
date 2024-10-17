import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
  withCredentials: true, // Permitir el envío de cookies
});

export const login = (credentials) => api.post('/auth/login', credentials);

export const getStudents = () => api.get('/students');

// Agrega más funciones para interactuar con otras rutas del backend
