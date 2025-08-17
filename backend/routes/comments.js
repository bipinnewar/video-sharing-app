const express = require('express');
   const jwt = require('jsonwebtoken');
   const { CosmosClient } = require('@azure/cosmos');
   const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');
   const router = express.Router();

   const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
   const database = cosmosClient.database('VideoDB');
   const commentContainer = database.container('Comments');
   const textAnalyticsClient = new TextAnalyticsClient(process.env.COGNITIVE_ENDPOINT, new AzureKeyCredential(process.env.COGNITIVE_KEY));

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

   router.post('/:id/comments', authenticate, async (req, res) => {
     try {
       const { text } = req.body;
       if (!text) return res.status(400).json({ error: 'Comment text required' });
       const sentimentResult = await textAnalyticsClient.analyzeSentiment([text]);
       const sentimentScore = sentimentResult[0].sentiment;
       const comment = {
         id: require('uuid').v4(),
         commentId: require('uuid').v4(),
         videoId: req.params.id,
         userId: req.user.userId,
         text,
         timestamp: new Date().toISOString(),
         sentimentScore
       };
       await commentContainer.items.create(comment);
       res.status(201).json({ message: 'Comment added', comment });
     } catch (err) {
       console.error('Add comment error:', err);
       res.status(500).json({ error: 'Failed to add comment', details: err.message });
     }
   });

   router.get('/:id/comments', async (req, res) => {
     try {
       const { resources } = await commentContainer.items
         .query({
           query: 'SELECT * FROM c WHERE c.videoId = @videoId',
           parameters: [{ name: '@videoId', value: req.params.id }]
         })
         .fetchAll();
       res.json(resources);
     } catch (err) {
       console.error('List comments error:', err);
       res.status(500).json({ error: 'Failed to get comments', details: err.message });
     }
   });

   module.exports = router;