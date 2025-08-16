const express = require('express');
const jwt = require('jsonwebtoken');
const { commentContainer, textAnalyticsClient } = require('../config/azure');
const router = express.Router();

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

router.post('/', authenticate, async (req, res) => {
  try {
    const { videoId, comment } = req.body;
    if (!videoId || !comment) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const sentimentResult = await textAnalyticsClient.analyzeSentiment([comment]);
    const sentiment = sentimentResult[0].sentiment;
    const confidenceScores = sentimentResult[0].confidenceScores;
    const commentData = {
      id: require('crypto').randomUUID(),
      videoId,
      userId: req.user.id,
      comment,
      sentiment,
      confidenceScores,
      createdAt: new Date()
    };
    await commentContainer.items.create(commentData);
    res.status(201).json({
      message: 'Comment added successfully',
      commentId: commentData.id,
      videoId,
      comment,
      sentiment,
      confidenceScores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.get('/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const { resources: comments } = await commentContainer.items
      .query(`SELECT * FROM c WHERE c.videoId = "${videoId}"`)
      .fetchAll();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

module.exports = router;