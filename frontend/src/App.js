import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import VideoUpload from './components/VideoUpload';
import Video from './components/Video';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element=<Home /> />
        <Route path="/signup" element=<Signup /> />
        <Route path="/login" element=<Login /> />
        <Route path="/upload" element={<ProtectedRoute><VideoUpload /></ProtectedRoute>} />
        <Route path="/video/:id" element=<Video /> />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;