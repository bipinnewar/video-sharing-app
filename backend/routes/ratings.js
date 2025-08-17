const express = require('express');
const jwt = require('jsonwebtoken');
const { CosmosClient } = require('@azure/cosmos');
const router = express.Router();

const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const database = cosmosClient.database('VideoDB');
const ratingContainer = database.container('Ratings');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { score } = req.body;
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Score must be an integer between 1 and 5' });
    }
    const ratingId = require('uuid').v4();
    const rating = {
      id: ratingId,
      ratingId,
      videoId: req.params.id,
      userId: req.user.userId,
      score,
      timestamp: new Date().toISOString()
    };
    await ratingContainer.items.create(rating);
    res.status(201).json({ message: 'Rating added', rating });
  } catch (err) {
    console.error('Add rating error:', err);
    res.status(500).json({ error: 'Failed to add rating', details: err.message });
  }
});

router.get('/:id/rating', async (req, res) => {
  try {
    const { resources } = await ratingContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.videoId = @videoId',
        parameters: [{ name: '@videoId', value: req.params.id }]
      })
      .fetchAll();
    res.json(resources);
  } catch (err) {
    console.error('List ratings error:', err);
    res.status(500).json({ error: 'Failed to get ratings', details: err.message });
  }
});

module.exports = router;