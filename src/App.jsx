import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Login from './pages/Login';
import Register from './pages/Register';
import Room from './pages/Room';  // Asegúrate de importar Room.jsx

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta dinámica para las salas */}
        <Route path="/room/:roomCode" element={<Room />} />  
        
        {/* Redirección por defecto al Login si no existe ninguna ruta */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
