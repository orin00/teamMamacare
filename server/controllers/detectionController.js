const fs = require('fs');
const path = require('path');
const { saveCapture } = require('../models/detectionModel');
const MemberModel = require('../models/memberModel'); // MemberModel을 가져옵니다

// Base64 데이터를 이미지 파일로 변환하는 함수
const saveBase64Image = (base64Data, filePath) => {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
};

// 얼굴 데이터 처리
exports.handleFaceData = (req, res) => {
  const { probability } = req.body;

  if (typeof probability !== 'number') {
    return res.status(400).json({ error: '얼굴 인식률이 숫자가 아닙니다' });
  }

  return res.status(200).json({ message: '얼굴 인식률이 성공적으로 수신되었습니다' });
};

// 이미지 캡처 저장
exports.saveCapture = (req, res) => {
  const { image, email } = req.body;

  if (!image || !email) {
    return res.status(400).json({ message: '이미지 및 이메일이 필요합니다' });
  }

  // 이메일로부터 닉네임 조회
  MemberModel.findByEmail(email, (error, member) => {
    if (error) {
      console.error('Error finding member:', error);
      return res.status(500).json({ message: '회원 정보를 조회하는 데 실패하였습니다' });
    }
    if (!member) {
      return res.status(404).json({ message: '회원 정보를 찾을 수 없습니다' });
    }

    const nickname = member.nickname; // 조회된 닉네임

    try {
      // 저장할 디렉토리 경로 설정
      const dir = path.join(__dirname, '../assets', email);

      // 디렉토리 생성
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 파일 경로 설정
      const filePath = path.join(dir, `capture_${Date.now()}.png`);
      const imageUrl = `/assets/${email}/capture_${Date.now()}.png`; // 저장된 이미지 URL

      // Base64 이미지를 파일로 저장
      saveBase64Image(image, filePath);

      // 데이터베이스에 저장
      const captureDateTime = new Date();

      saveCapture(email, nickname, imageUrl, captureDateTime, (error, result) => {
        if (error) {
          console.error('Error saving capture:', error);
          return res.status(500).json({ message: '캡처 이미지 저장에 실패하였습니다' });
        }
      
        return res.status(200).json({ message: '캡처 이미지가 성공적으로 저장되었습니다', imageUrl: imageUrl });
      });
    } catch (error) {
      console.error('Error saving capture:', error);
      return res.status(500).json({ message: '캡처 이미지 저장에 실패하였습니다' });
    }
  });
};
