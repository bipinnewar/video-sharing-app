import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get('https://video-backend-app.azurewebsites.net/api/videos')
      .then(response => setVideos(response.data))
      .catch(error => console.error('Error fetching videos:', error));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="hero-section">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Welcome to VideoVerse</h1>
        <p className="text-lg md:text-xl">Share, watch, and connect through videos!</p>
      </div>
      <nav className="navbar flex justify-center space-x-6">
        <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Sign Up</Link>
        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Log In</Link>
        <Link to="/upload" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Upload Video</Link>
        <Link to="/profile" className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition-colors">Profile</Link>
      </nav>
      <h2 className="text-3xl font-bold mt-8 mb-6 text-gray-800">Explore Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <div className="relative">
              <video className="w-full rounded-t-xl" controls>
                <source src={`${video.url}?${video.sasToken}`} type="video/mp4" />
              </video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
                <h3 className="text-white text-lg font-semibold">{video.title}</h3>
              </div>
            </div>
            <div className="p-4">
              <Link to={`/video/${video.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">View Comments</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;