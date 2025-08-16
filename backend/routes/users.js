const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userContainer } = require('../config/azure');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !['creator', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { resources: existingUsers } = await userContainer.items
      .query(`SELECT * FROM c WHERE c.email = "${email}"`)
      .fetchAll();
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: require('crypto').randomUUID(),
      email,
      password: hashedPassword,
      role,
      createdAt: new Date()
    };
    await userContainer.items.create(user);
    const token = jwt.sign({ id: user.id, email, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      message: 'User created successfully',
      userId: user.id,
      email,
      role,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { resources: users } = await userContainer.items
      .query(`SELECT * FROM c WHERE c.email = "${email}"`)
      .fetchAll();
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Login successful',
      userId: user.id,
      email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;