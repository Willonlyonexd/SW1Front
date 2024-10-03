import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../sockets/socket';
import Diagram from '../components/Diagram';  // Asegúrate de que la ruta sea correcta

const Room = () => {
  const { roomCode } = useParams(); // Obtiene el roomCode de la URL
  const diagramRef = useRef(null);
  //const [message, setMessage] = useState('');
  //const [messages, setMessages] = useState([]);
  const [setUsersInRoom] = useState([]);

  useEffect(() => {
    const username = localStorage.getItem('username');
    
    // Unirse a la sala con Socket.IO
    socket.emit('join_room', roomCode, username);

    // Escuchar la lista de usuarios en la sala
    socket.on('users_in_room', (users) => {
      setUsersInRoom(users);
    });

  
    // Escuchar los cambios en el diagrama de otros usuarios
    socket.on('diagram_update', (data) => {
      if (diagramRef.current) {
        // Aplicar los cambios al diagrama localmente
        diagramRef.current.applyChangesFromSocket(data);
      }
    });

    return () => {
      socket.off('users_in_room');
      socket.off('receive_message');
      socket.off('diagram_update');  // Desmontar el listener
    };
  }, [roomCode,setUsersInRoom]);

  
  // Función para enviar actualizaciones del diagrama
  const handleDiagramChange = (changes) => {
    // Enviar los cambios al servidor
    socket.emit('diagram_change', { roomCode, changes });
  };
  

  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="text-2xl mb-2">Sala: {roomCode}</h1>

      {/* Componente de Diagram con roomCode pasado como prop */}
      <Diagram roomCode={roomCode} ref={diagramRef} onDiagramChange={handleDiagramChange} />
    </div>
  );
};

export default Room;
