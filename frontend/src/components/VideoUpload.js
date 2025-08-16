import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function VideoUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    try {
      await axios.post('https://video-backend-app.azurewebsites.net/api/videos', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error.response.data);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Upload Your Video</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="file"
            accept="video/mp4"
            onChange={e => setFile(e.target.files[0])}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <button type="submit" className="gradient-btn w-full">
          Upload
        </button>
      </form>
    </div>
  );
}

export default VideoUpload;