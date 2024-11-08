const mysql = require("mysql");
require("dotenv").config();

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: "localhost",
    user: process.env.dbUser,  // MySQL 사용자 이름
    password: process.env.dbPassword,  // MySQL 사용자 비밀번호
    database: process.env.dbdatabase  // 연결할 데이터베이스 이름
});

// MySQL 연결
db.connect((err) => {
    if (err) {
        console.error("MySQL 연결 실패:", err);
    } else {
        console.log("MySQL에 성공적으로 연결되었습니다.");
    }
});

module.exports = db; // MySQL 연결 객체를 모듈로 내보냅니다.
