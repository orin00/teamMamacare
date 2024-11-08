const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/detectionController');

// POST /face-data - 얼굴 데이터 처리
router.post('/face-data', detectionController.handleFaceData);

// POST /save-capture - 이미지 캡처 저장
router.post('/save-capture', detectionController.saveCapture);

module.exports = router;
