   require('dotenv').config();
   const express = require('express');
   const cors = require('cors');
   const app = express();

   // Configure CORS to allow requests from the frontend
   app.use(cors({
     origin: ['http://localhost:3000', 'https://happy-island-0f80c1103.2.azurestaticapps.net'],
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));

   app.use(express.json());

   // Health endpoint
   app.get('/api/health', (req, res) => res.send('OK'));

   // Routes
   app.use('/api/auth', require('./routes/auth'));
   app.use('/api/videos', require('./routes/videos'));
   app.use('/api/videos', require('./routes/comments')); // Updated to mount under /api/videos
   app.use('/api/videos', require('./routes/ratings')); // Updated to mount under /api/videos

   const port = process.env.PORT || 3000;
   app.listen(port, () => console.log(`Server running on port ${port}`));