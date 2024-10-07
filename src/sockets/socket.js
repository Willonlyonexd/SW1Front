import { io } from 'socket.io-client';

// Conectarse al servidor de Socket.IO (ajusta la URL según sea necesario)
const socket = io('https://backendconbd.onrender.com');
export default socket;
