require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid');

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // 1 hour = 3600000 ms
    res.cookie('eis_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000,
    });

    return res.json({ user: { email: user.email, role: user.role } });
  } catch (err) {
    // Generic error to avoid enumeration
    return res.status(401).json({ error: 'Invalid email or password' });
  }
});

// GET /auth/me – returns user info based on JWT cookie
app.get('/auth/me', (req, res) => {
  const token = req.cookies?.eis_token;
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload contains { userId, role, iat, exp }
    return res.json({ id: payload.userId, role: payload.role });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Global error handler (fallback)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth API listening on port ${PORT}`);
});
