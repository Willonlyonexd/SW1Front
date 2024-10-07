import { io } from 'socket.io-client';

// Conectarse al servidor de Socket.IO (ajusta la URL según sea necesario)
const socket = io('https://tu-backend-en-render.com');
export default socket;
