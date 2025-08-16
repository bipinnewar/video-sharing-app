require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => res.send('OK'));

// Routes
app.use('/api/videos', require('./routes/videos'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));