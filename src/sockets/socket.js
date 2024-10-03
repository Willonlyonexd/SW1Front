import { io } from 'socket.io-client';

// Conectarse al servidor de Socket.IO (ajusta la URL según sea necesario)
const socket = io('http://localhost:5000');  // Asegúrate de que la URL corresponda al backend

export default socket;
