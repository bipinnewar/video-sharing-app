import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

function Profile() {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;

  useEffect(() => {
    if (user) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/videos`)
        .then(response => setVideos(response.data.filter(v => v.userId === user.id)))
        .catch(error => console.error('Error fetching videos:', error));
    }
  }, []);

  if (!user) return <div className="text-center py-12 text-gray-600">Please log in</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Profile: {user.email}</h2>
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Your Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="video-card">
            <div className="relative">
              <video className="w-full rounded-t-xl" controls>
                <source src={`${video.url}?${video.sasToken}`} type="video/mp4" />
              </video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
                <h4 className="text-white text-lg font-semibold">{video.title}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;