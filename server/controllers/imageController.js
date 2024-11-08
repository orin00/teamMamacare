const db = require('../dbConnect/dbConnection');

exports.getImagesByEmail = (req, res) => {
  const email = req.body.email;

  // 데이터베이스에서 해당 이메일의 이미지 파일명과 캡처 날짜를 가져오는 쿼리
  const query = `SELECT image_url AS filename, capture_datetime AS date FROM detection WHERE email = ? ORDER BY capture_datetime DESC`;

  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '데이터베이스에서 이미지를 가져오는 데 실패했습니다.' });
    }

    res.json(results); // 파일명과 날짜를 JSON 형태로 응답
  });
};

