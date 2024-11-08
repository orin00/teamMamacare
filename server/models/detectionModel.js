const db = require("../dbConnect/dbConnection");

const saveCapture = (email, nickname, imageUrl, captureDateTime, callback) => {
    const query = `INSERT INTO detection (email, nickname, image_url, capture_datetime) VALUES (?, ?, ?, ?)`;
    db.query(query, [email, nickname, imageUrl, captureDateTime], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results);
    });
};

module.exports = { saveCapture };