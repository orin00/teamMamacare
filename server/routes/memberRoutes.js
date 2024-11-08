const express = require("express");
const MemberController = require("../controllers/memberController");

const router = express.Router();

// 회원가입 라우트
router.post('/signup', MemberController.signUp);

// 로그인 라우트
router.post('/login', MemberController.login);  

// 사용자 정보 조회 라우트
router.get('/user', MemberController.getUserByEmail);

// Add the route for deleting a member
router.delete('/delete', MemberController.deleteAccount);

module.exports = router;
