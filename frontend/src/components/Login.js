import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://video-backend-app.azurewebsites.net/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response.data);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Log In to Your Account</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-6">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
        </div>
        <button type="submit" className="gradient-btn w-full">
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;