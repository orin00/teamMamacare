const db = require("../dbConnect/dbConnection");

// 모델은 데이터베이스와의 상호작용을 담당
const MemberModel = {
    createMember: (memberData, callback) => {
        const query = 'INSERT INTO members (email, password, nickname, role) VALUES (?, ?, ?, ?)';
        db.query(query, [memberData.email, memberData.password, memberData.nickname, 'member'], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM members WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]); // 첫 번째 결과를 반환
        });
    },
    deleteMember: (email, callback) => {
        const query = 'DELETE FROM members WHERE email = ?';
        db.query(query, [email], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    }
};

module.exports = MemberModel;
