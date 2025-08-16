const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { videoContainer, blobServiceClient } = require('../config/azure');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'creator') return res.status(403).json({ error: 'Only creators can upload videos' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', authenticate, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });
    const videoId = require('crypto').randomUUID();
    const blobName = `${videoId}.mp4`;
    const containerClient = blobServiceClient.getContainerClient('videos');
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.uploadData(req.file.buffer, { blobHTTPHeaders: { blobContentType: 'video/mp4' } });
    const sasToken = await blobClient.generateSasUrl({
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 24 * 60 * 60 * 1000),
      permissions: 'read'
    });
    const video = {
      id: videoId,
      title: req.body.title,
      description: req.body.description,
      url: blobClient.url,
      userId: req.user.id,
      createdAt: new Date()
    };
    await videoContainer.items.create(video);
    res.status(201).json({
      message: 'Video uploaded successfully',
      videoId,
      title: req.body.title,
      url: blobClient.url,
      sasToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { resources: videos } = await videoContainer.items.readAll().fetchAll();
    const videosWithSas = await Promise.all(
      videos.map(async (video) => {
        const blobClient = blobServiceClient.getContainerClient('videos').getBlockBlobClient(`${video.id}.mp4`);
        const sasToken = await blobClient.generateSasUrl({
          startsOn: new Date(),
          expiresOn: new Date(new Date().valueOf() + 24 * 60 * 60 * 1000),
          permissions: 'read'
        });
        return { ...video, sasToken };
      })
    );
    res.json(videosWithSas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

module.exports = router;