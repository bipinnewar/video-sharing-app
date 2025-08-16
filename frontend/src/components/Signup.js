import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [errorMessage, setErrorMessage] = useState(''); // Add state for error display
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    try {
      console.log('API_URL:', process.env.REACT_APP_API_URL);
      console.log('Form data:', { email, password, role });
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/signup`, {
        email,
        password,
        role
      });
      console.log('Signup response:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error.message);
      // Handle error for user display
      setErrorMessage(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Create Your Account</h2>
      {errorMessage && (
        <div className="max-w-md mx-auto mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}
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
        <div className="mb-6">
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="viewer">Viewer</option>
            <option value="creator">Creator</option>
          </select>
        </div>
        <button type="submit" className="gradient-btn w-full">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;