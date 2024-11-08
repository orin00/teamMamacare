const express = require('express');
const router = express.Router();
const { sendAlertEmail } = require('../controllers/alertController');

// 이메일 알림 라우트
router.post('/send-alert', sendAlertEmail);

module.exports = router;
