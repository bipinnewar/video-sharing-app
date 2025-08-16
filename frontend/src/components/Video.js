import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/videos`)
      .then(response => {
        const videoData = response.data.find(v => v.id === id);
        setVideo(videoData);
      });
    axios.get(`${process.env.REACT_APP_API_URL}/api/comments/${id}`)
      .then(response => setComments(response.data));
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/comments`, { videoId: id, comment: commentText }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Comment added successfully!');
      setCommentText('');
      axios.get(`${process.env.REACT_APP_API_URL}/api/comments/${id}`)
        .then(response => setComments(response.data));
    } catch (error) {
      console.error('Comment error:', error.message);
      toast.error(error.response?.data?.message || 'Comment failed. Please try again.');
    }
  };

  if (!video) return <div className="text-center py-12 text-gray-600">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{video.title}</h2>
      <video className="w-full max-w-4xl mx-auto rounded-xl shadow-lg" controls>
        <source src={`${video.url}?${video.sasToken}`} type="video/mp4" />
      </video>
      <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Comments</h3>
      <form onSubmit={handleCommentSubmit} className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-4"
          required
        />
        <button type="submit" className="gradient-btn w-full">
          Comment
        </button>
      </form>
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white p-4 rounded-xl shadow-lg">
            <p className="text-gray-700">{comment.comment}</p>
            <p className="text-sm text-gray-500">Sentiment: {comment.sentiment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Video;