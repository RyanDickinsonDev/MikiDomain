const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload');

const { ensureAuthenticated } = require("../middleware/auth.js");

router.post('/api/upload', ensureAuthenticated, uploadController.uploadProfilePicture);
router.get('/api/download', ensureAuthenticated, uploadController.getProfilePicture);

module.exports = router;