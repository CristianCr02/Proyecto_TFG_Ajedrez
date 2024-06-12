// routes.js

const express = require('express');
const router = express.Router();
const { loginUser, registerUser, verifyToken, getProfileInfo, incrementWins, incrementLosses } = require('./controller/userController');
const { ws } = require('./controller/wsController');
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify', verifyToken);
router.get('/profile', getProfileInfo);
router.post('/profile/wins', incrementWins);
router.post('/profile/losses', incrementLosses);
router.ws('/ws', ws);

module.exports = router;
