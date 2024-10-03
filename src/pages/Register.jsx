import { useState } from 'react';  // Importar useState
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';  // Para redirigir

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      alert('Registro exitoso');
      navigate('/login'); 
        } catch (err) {
      console.error(err);
      alert('Error en el registro');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="bg-white p-8 shadow-md" onSubmit={handleSubmit}>
        <h2 className="mb-4 text-xl">Registro</h2>
        <input
          type="text"
          placeholder="Name"
          className="border p-2 mb-4 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-4 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-4 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
