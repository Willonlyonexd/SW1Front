import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="text-white">DiagramColab</div>
          <div className="flex space-x-4">
            <Link to="/" className="text-white">
              Login
            </Link>
            <Link to="/register" className="text-white">
              Register
            </Link>
            <Link to="/create-room" className="text-white">
              Create Room
            </Link>
            <Link to="/join-room" className="text-white">
              Join Room
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
