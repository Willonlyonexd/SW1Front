import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configuración de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para el login
export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Función para el registro
export const register = async (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

// Obtener salas donde es admin o colaborador
export const getUserRooms = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },  // Asegúrate de incluir el prefijo 'Bearer'
  };
  const response = await api.get('/rooms/user-rooms', config);  // Usamos 'api' en lugar de 'axios'
  return response;
};

// Crear sala
export const createRoom = async (token, roomName) => {
  return api.post(
    '/rooms/create',
    { roomName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Unirse a sala
export const joinRoom = async (token, roomCode) => {
  return api.post(
    '/rooms/join',
    { roomCode },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
