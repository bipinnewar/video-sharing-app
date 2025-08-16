import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar flex justify-center space-x-6">
      <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Home</Link>
      {!token ? (
        <>
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Sign Up</Link>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Log In</Link>
        </>
      ) : (
        <>
          <Link to="/upload" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Upload Video</Link>
          <Link to="/profile" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Profile</Link>
          <button onClick={handleLogout} className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Log Out</button>
        </>
      )}
    </nav>
  );
}

export default Navbar;