require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'https://happy-island-0f80c1103.2.azurestaticapps.net',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => res.send('OK'));

// Routes
app.use('/api/videos', require('./routes/videos'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));