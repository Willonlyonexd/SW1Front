import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { createRoom } from '../services/api';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Para redirigir al usuario a la sala

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');  // Obtener token

    if (!token) {
      setError('No se ha encontrado el token. Por favor, inicia sesión.');
      return;
    }

    if (!roomName) {
      setError('Por favor, ingresa un nombre para la sala.');
      return;
    }

    try {
      const { data } = await createRoom(token, roomName);
      // Redirigir al usuario a la nueva sala usando el room_code
      navigate(`/room/${data.room_code}`);
    } catch (err) {
      console.error(err);
      setError('Error al crear la sala');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="bg-white p-8 shadow-md" onSubmit={handleSubmit}>
        <h2 className="mb-4 text-xl">Crear Sala</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Room Name"
          className="border p-2 mb-4 w-full"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Crear Sala
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
