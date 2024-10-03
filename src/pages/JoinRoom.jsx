import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom } from '../services/api';

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Para redirigir al usuario

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No se ha encontrado el token. Por favor, inicia sesión.');
      return;
    }

    if (!roomCode) {
      setError('Por favor, ingresa un código de sala.');
      return;
    }

    try {
      const { data } = await joinRoom(token, roomCode);
      alert(`Te has unido a la sala: ${data.room_name}`);
      setError(null);

      // Redirigir al usuario a la ruta de la sala
      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error('Error uniendo a la sala:', err);
      setError('Error al unirse a la sala. Verifica el código y vuelve a intentarlo.');
    }
  };

  return (
    <div className="flex flex-col items-center h-screen">
      <form className="bg-white p-8 shadow-md mb-4" onSubmit={handleSubmit}>
        <h2 className="mb-4 text-xl">Unirse a una Sala</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Código de Sala"
          className="border p-2 mb-4 w-full"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Unirse a Sala
        </button>
      </form>
    </div>
  );
};

export default JoinRoom;
