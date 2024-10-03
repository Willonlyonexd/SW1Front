import { useEffect, useState } from 'react';
import { getUserRooms, joinRoom as apiJoinRoom } from '../services/api';  // Importamos el método joinRoom de la API
import { useNavigate } from 'react-router-dom';  // Para redirigir al usuario después de unirse a la sala

const Dashboard = () => {
  const [adminRooms, setAdminRooms] = useState([]);
  const [collaboratorRooms, setCollaboratorRooms] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('admin');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('token');
  
      if (!token) {
        setError('No se ha encontrado el token. Por favor, inicia sesión.');
        return;
      }
  
      try {
        const { data } = await getUserRooms(token);
        setAdminRooms(data.adminRooms || []);
        setCollaboratorRooms(data.collaboratorRooms || []);
        setError(null);
      } catch  {
        setError('Error obteniendo las salas. Por favor, inténtalo de nuevo.');
      }
    };
  
    fetchRooms();
  }, []);

  // Función para unirse a la sala
  const joinRoom = async (roomCode) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No se ha encontrado el token. Por favor, inicia sesión.');
      return;
    }

    try {
      await apiJoinRoom(token, roomCode);
      navigate(`/room/${roomCode}`);
    } catch  {
      setError('Error al unirse a la sala. Verifica el código y vuelve a intentarlo.');
    }
  };

  // Función para redirigir a la vista de crear sala
  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');  // Eliminar el token del localStorage
    navigate('/login');  // Redirigir al login
  };

  return (
    <div className="bg-black text-white w-screen h-screen flex flex-col items-center justify-center p-0"> {/* Expande todo el fondo */}
      <a href="#" className="mb-4">  {/* Este es el logo similar al login */}
        <div className="text-foreground font-semibold text-2xl tracking-tighter flex items-center gap-2">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0L11.174 18.825l.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
            </svg>
          </div>
          Diagramador de Clases Colaborativo
        </div>
      </a>

      <div className="w-full max-w-4xl bg-gray-800 text-white p-8 rounded-md shadow-lg h-auto"> {/* Fondo y contenedor de las salas */}
        <h1 className="text-2xl mb-4">Dashboard de Salas</h1>
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex space-x-4 mb-8">
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-md"
            onClick={handleCreateRoom}
          >
            Crear sala
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md"
            onClick={() => navigate('/join-room')}
          >
            Unirse a sala
          </button>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 ${activeTab === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setActiveTab('admin')}
          >
            Como administrador 👾
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'collaborator' ? 'bg-purple-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setActiveTab('collaborator')}
          >
            Como colaborador 🤖
          </button>
        </div>

        {/* Renderizar salas según la pestaña activa */}
        {activeTab === 'admin' ? (
          <div>
            <h2 className="text-xl mb-4">Salas donde eres Admin</h2>
            <div className="flex flex-wrap gap-4">
              {adminRooms.length > 0 ? (
                adminRooms.map(room => (
                  <div key={room.id} className="bg-blue-500 text-white p-4 rounded-md shadow-md">
                    {room.room_name} - 
                    <button 
                      className="ml-2 bg-blue-700 p-1 rounded"
                      onClick={() => joinRoom(room.room_code)}>
                      Unirse
                    </button>
                  </div>
                ))
              ) : (
                <p>No eres admin de ninguna sala</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">Salas donde eres Colaborador</h2>
            <div className="flex flex-wrap gap-4">
              {collaboratorRooms.length > 0 ? (
                collaboratorRooms.map(room => (
                  <div key={room.id} className="bg-blue-500 text-white p-4 rounded-md shadow-md">
                    {room.room_name} - 
                    <button 
                      className="ml-2 bg-blue-700 p-1 rounded"
                      onClick={() => joinRoom(room.room_code)}>
                      Unirse
                    </button>
                  </div>
                ))
              ) : (
                <p>No participas en ninguna sala como colaborador</p>
              )}
            </div>
          </div>
        )}

        {/* Botón de Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 w-full mt-8 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};



export default Dashboard;
