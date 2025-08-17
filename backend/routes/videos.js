const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const database = cosmosClient.database('VideoDB');
const videoContainer = database.container('Videos');
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient('videos');

const authenticateCreator = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'CREATOR') return res.status(403).json({ error: 'Only creators can perform this action' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', authenticateCreator, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });
    const { title, description, publisher, producer, genre, ageRating } = req.body;
    if (!title || !description || !publisher || !producer || !genre || !ageRating) {
      return res.status(400).json({ error: 'Missing required metadata' });
    }
    const videoId = uuidv4();
    const videoBlobName = `${videoId}/${req.file.originalname}`;
    const thumbnailBlobName = `${videoId}/thumbnail.jpg`;

    // Upload video to Blob Storage
    const videoBlobClient = containerClient.getBlockBlobClient(videoBlobName);
    await videoBlobClient.uploadData(req.file.buffer, { blobHTTPHeaders: { blobContentType: 'video/mp4' } });

    // Create a temporary file for thumbnail generation
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tmpVideoPath = path.join(tmpDir, `${videoId}.mp4`);
    fs.writeFileSync(tmpVideoPath, req.file.buffer);

    // Generate thumbnail
    const thumbnailPath = path.join(tmpDir, `${videoId}_thumbnail.jpg`);
    await new Promise((resolve, reject) => {
      ffmpeg(tmpVideoPath)
        .screenshots({
          count: 1,
          folder: tmpDir,
          filename: `${videoId}_thumbnail.jpg`,
          size: '320x240'
        })
        .on('end', () => {
          console.log('Thumbnail generated successfully');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        });
    });

    // Upload thumbnail to Blob Storage
    const thumbnailBlobClient = containerClient.getBlockBlobClient(thumbnailBlobName);
    await thumbnailBlobClient.uploadFile(thumbnailPath, { blobHTTPHeaders: { blobContentType: 'image/jpeg' } });

    // Clean up temporary files
    fs.unlinkSync(tmpVideoPath);
    fs.unlinkSync(thumbnailPath);

    // Save video metadata to Cosmos DB
    const video = {
      id: videoId,
      videoId,
      title,
      description,
      publisher,
      producer,
      genre,
      ageRating,
      uploadedBy: req.user.userId,
      videoUrl: videoBlobClient.url,
      thumbnailUrl: thumbnailBlobClient.url,
      createdAt: new Date().toISOString()
    };
    await videoContainer.items.create(video);
    res.status(201).json({ message: 'Video uploaded successfully', video });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ error: 'Failed to upload video', details: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { resources: videos } = await videoContainer.items.readAll().fetchAll();
    res.json(videos);
  } catch (err) {
    console.error('List videos error:', err);
    res.status(500).json({ error: 'Failed to list videos', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { resource: video } = await videoContainer.item(req.params.id, req.params.id).read();
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (err) {
    console.error('Get video error:', err);
    res.status(500).json({ error: 'Failed to get video', details: err.message });
  }
});

router.put('/:id', authenticateCreator, async (req, res) => {
  try {
    const { resource: video } = await videoContainer.item(req.params.id, req.params.id).read();
    if (!video || video.uploadedBy !== req.user.userId) {
      return res.status(403).json({ error: 'Video not found or not owned by user' });
    }
    const { title, description, publisher, producer, genre, ageRating } = req.body;
    const updatedVideo = {
      ...video,
      title: title || video.title,
      description: description || video.description,
      publisher: publisher || video.publisher,
      producer: producer || video.producer,
      genre: genre || video.genre,
      ageRating: ageRating || video.ageRating
    };
    await videoContainer.item(req.params.id, req.params.id).replace(updatedVideo);
    res.json({ message: 'Video updated successfully', video: updatedVideo });
  } catch (err) {
    console.error('Update video error:', err);
    res.status(500).json({ error: 'Failed to update video', details: err.message });
  }
});

router.delete('/:id', authenticateCreator, async (req, res) => {
  try {
    const { resource: video } = await videoContainer.item(req.params.id, req.params.id).read();
    if (!video || video.uploadedBy !== req.user.userId) {
      return res.status(403).json({ error: 'Video not found or not owned by user' });
    }
    await videoContainer.item(req.params.id, req.params.id).delete();
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error('Delete video error:', err);
    res.status(500).json({ error: 'Failed to delete video', details: err.message });
  }
});

module.exports = router;