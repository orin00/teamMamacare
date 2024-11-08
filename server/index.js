const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// 라우터
const memberRoutes = require('./routes/memberRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const imageRoutes = require('./routes/imageRoutes');
// .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 미들웨어
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' })); // Max JSON request body size of 50MB
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Max URL-encoded request body size of 50MB


app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/images', express.static(path.join(__dirname, 'assets')));

// Routes setup
app.use('/api/member', memberRoutes);
app.use('/api/alert', alertRoutes);
app.use('/api/detect', detectionRoutes);
app.use('/api', imageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});