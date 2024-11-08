const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // .env 파일에서 환경 변수를 불러옴

// Nodemailer 설정
const transporter = nodemailer.createTransport({
  service: 'Naver', // 사용하고 있는 이메일 서비스
  host: 'smtp.naver.com',
  port: 465,
  auth: {
    // 추후 .env 설정
    user: process.env.NAVER_EMAIL, // 자신의 이메일
    pass: process.env.NAVER_PASS // 자신의 이메일 비밀번호
  }
});

// 이메일 전송 함수
exports.sendAlertEmail = (req, res) => {
  const { email, imageUrl } = req.body;

  // 캡처된 이미지 경로
  const imagePath = path.join(__dirname, '..', imageUrl);

  // 이메일 옵션 설정
  const mailOptions = {
    // 추후 .env 설정
    from: process.env.NAVER_EMAIL,
    to: email,
    subject: '아기의 얼굴이 5초 이상 감지되지 않습니다. 확인 바랍니다.',
    text: '아기의 얼굴이 5초 이상 감지되지 않습니다. 확인 바랍니다.',
    attachments: [
      {
        filename: path.basename(imagePath),
        path: imagePath
      }
    ]
  };

  // 이메일 전송
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: '이메일 전송에 실패하였습니다.' });
    }
    console.log('Email sent:', info.response);
    return res.status(200).json({ message: '이메일이 성공적으로 전송되었습니다.' });
  });
};
