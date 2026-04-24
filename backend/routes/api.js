// routes/api.js — EduBot API Routes
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// ── Health Check ──────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'EduBot API running', timestamp: new Date().toISOString() });
});

// ── Auth ──────────────────────────────────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', verifyToken, authController.getProfile);

// ── Chat ──────────────────────────────────────────────────
router.post('/chat', chatController.processChat);

// ── Quiz Generator ────────────────────────────────────────
router.post('/quiz/generate', chatController.generateQuiz);

// ── Personalized Study Plan ───────────────────────────────
router.post('/study-plan/generate', chatController.generateStudyPlan);

module.exports = router;