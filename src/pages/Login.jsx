import { useState } from 'react';
import { login } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(email, password);
      localStorage.setItem('token', data.token);
      alert('Login exitoso');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error en el login');
    }
  };

  return (
    <div className="bg-black text-white flex flex-col justify-center items-center h-screen w-screen"> {/* Cambiado a flex-col */}
      <a href="#" className="mb-4">  {/* Margen inferior para separar el texto del formulario */}
        <div className="text-foreground font-semibold text-2xl tracking-tighter mx-auto flex items-center gap-2">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0L11.174 18.825l.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
            </svg>
          </div>
          Diagramador de Clases Colaborativo
        </div>
      </a>
  
      <div className="relative mt-12 w-full max-w-lg sm:mt-10">
        <div className="relative -mb-px h-px w-full bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
        <div className="mx-5 border dark:border-b-white/50 dark:border-t-white/50 border-b-white/20 sm:border-t-white/20 shadow-lg rounded-lg border-white/20 border-l-white/20 border-r-white/20 sm:shadow-sm lg:rounded-xl">
          <div className="flex flex-col p-6">
            <h3 className="text-xl font-semibold leading-6 tracking-tighter">Login</h3>
            <p className="mt-1.5 text-sm font-medium text-white/50">Colabora juntos a tus amigos en tiempo real 👌🏻.</p>
          </div>
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit}>
              <div>
                <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5">
                  <label className="text-xs font-medium text-gray-400">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-foreground"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="group relative rounded-lg border px-3 pb-1.5 pt-2.5">
                  <label className="text-xs font-medium text-gray-400">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-foreground"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="outline-none focus:outline focus:outline-sky-300" />
                  <span className="text-xs">Remember me</span>
                </label>
                <a className="text-sm font-medium text-foreground underline" href="/forgot-password">Forgot password?</a>
              </div>
              <div className="mt-4 flex items-center justify-end gap-x-2">
                <Link to="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-white text-black px-4 py-2">
                  Register
                </Link>
                <button type="submit" className="font-semibold hover:bg-white hover:text-black hover:ring hover:ring-black transition duration-300 inline-flex items-center justify-center rounded-md text-sm bg-cyan text-black px-4 py-2">
                  Log in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
