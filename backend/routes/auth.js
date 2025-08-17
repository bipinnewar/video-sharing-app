const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CosmosClient } = require('@azure/cosmos');
const router = express.Router();

const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY });
const database = cosmosClient.database('VideoDB');
const userContainer = database.container('Users');

router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !['CREATOR', 'CONSUMER'].includes(role)) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  try {
    const { resources } = await userContainer.items.query(`SELECT * FROM c WHERE c.email = '${email}'`).fetchAll();
    if (resources.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, email, passwordHash: hashedPassword, role, createdAt: new Date().toISOString() };
    await userContainer.items.create(user);
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User created', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { resources } = await userContainer.items.query(`SELECT * FROM c WHERE c.email = '${email}'`).fetchAll();
    const user = resources[0];
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;