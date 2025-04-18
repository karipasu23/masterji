const express = require('express');
const router = express.Router();
const { imageUploader } = require('../auth-controller/image-controller')

router.post('/image', imageUploader);

module.exports = router;