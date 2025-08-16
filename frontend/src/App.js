import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import VideoUpload from './components/VideoUpload';
import Video from './components/Video';
import Profile from './components/Profile';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<VideoUpload />} />
        <Route path="/video/:id" element={<Video />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;