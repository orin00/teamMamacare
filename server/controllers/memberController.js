const MemberModel = require("../models/memberModel");
const bcrypt = require('bcryptjs');
const db = require('../dbConnect/dbConnection');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const secretKey = process.env.secretKey; // JWT를 위한 비밀키 설정

const MemberController = {
    signUp: (req, res) => {
        const { email, password, nickname } = req.body;

        if (!email || !password || !nickname) {
            return res.status(400).send('입력란을 모두 입력해주세요');
        }

        MemberModel.findByEmail(email, (err, user) => {
            if (err) return res.status(500).send('서버에 에러가 발생하였습니다');
            if (user) return res.status(409).send('이메일이 이미 있습니다');

            const hashedPassword = bcrypt.hashSync(password, 8);

            const userData = {
                email,
                password: hashedPassword,
                nickname
            };

            MemberModel.createMember(userData, (err, result) => {
                if (err) return res.status(500).send('서버에 에러가 발생하였습니다');
                res.status(201).send('사용자 등록 완료');
            });
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('이메일 또는 비밀번호를 입력해주세요');
        }

        MemberModel.findByEmail(email, (err, user) => {
            if (err) return res.status(500).send('서버에 에러가 발생하였습니다');
            if (!user) return res.status(404).send('회원가입 된 사용자가 아닙니다');

            // user 객체가 정의되어 있음을 확인
            if (!user) {
                return res.status(404).send('회원가입 된 사용자가 아닙니다');
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) return res.status(401).send('잘못된 비밀번호를 입력하였습니다');

            // 사용자 인증이 성공하면 JWT 생성
            const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

            res.status(200).send({ auth: true, token });
        });
    },

    getUserByEmail: (req, res) => {
        const { email } = req.query;

        if (!email) {
            return res.status(400).send('해당 이메일을 찾을 수 없습니다');
        }

        MemberModel.findByEmail(email, (err, user) => {
            if (err) return res.status(500).send('서버에 에러가 발생하였습니다');
            if (!user) return res.status(404).send('사용자를 찾을 수 없습니다');

            // 사용자 정보를 응답으로 보냄
            res.status(200).send({ email: user.email, nickname: user.nickname });
        });
    },

    deleteAccount: (req, res) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: '이메일이 제공되지 않았습니다.' });
        }

        try {
            // 1. 사용자의 파일 시스템에서 이메일에 해당하는 폴더를 삭제
            const userDir = path.join(__dirname, '../assets', email);

            // Check if the folder exists and delete it
            if (fs.existsSync(userDir)) {
                fs.rmdirSync(userDir, { recursive: true });
                console.log(`${email} 폴더가 삭제되었습니다.`);
            } else {
                console.log(`${email} 폴더가 존재하지 않습니다.`);
            }

            // 2. 데이터베이스에서 detection 테이블에서 해당 사용자의 데이터를 삭제
            const deleteDetectionQuery = `DELETE FROM detection WHERE email = ?`;

            db.query(deleteDetectionQuery, [email], (err, results) => {
                if (err) {
                    console.error('데이터베이스에서 회원 데이터를 삭제하는 데 실패했습니다:', err);
                    return res.status(500).json({ message: '데이터베이스에서 회원 데이터를 삭제하는 데 실패했습니다.' });
                }
                console.log(`${email} 사용자의 데이터가 detection 테이블에서 삭제되었습니다.`);
            });

            // 3. 데이터베이스에서 members 테이블에서 해당 사용자의 데이터를 삭제
            const deleteMemberQuery = `DELETE FROM members WHERE email = ?`;

            db.query(deleteMemberQuery, [email], (err, results) => {
                if (err) {
                    console.error('데이터베이스에서 회원 정보를 삭제하는 데 실패했습니다:', err);
                    return res.status(500).json({ message: '데이터베이스에서 회원 정보를 삭제하는 데 실패했습니다.' });
                }

                // 성공적으로 삭제된 경우
                console.log(`${email} 사용자의 정보가 members 테이블에서 삭제되었습니다.`);
                return res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
            });
        } catch (error) {
            console.error('회원 탈퇴 처리 중 오류가 발생했습니다:', error);
            return res.status(500).json({ message: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
        }
    }
};

module.exports = MemberController;
