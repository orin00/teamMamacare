<template>
  <nav>
    <div class="nav-container">
      <div class="header-start">
        <router-link to="/">
          <div class="project-name">
            <img alt="logo_main" src="../assets/logo.png" />
            <span>Honey Moon</span>
          </div>
        </router-link>
      </div>
      <div class="header-center">
        <router-link :to="getLink('/cam')">실시간 알리미</router-link>
        <router-link :to="getLink('/capture')">갤러리</router-link>
        <router-link to="/hospital">병원 정보</router-link>
        <router-link to="/cpr">심폐소생술</router-link>
      </div>
      <div class="header-end">
        <!-- 로그인 상태 -->
        <span v-if="isLoggedIn">
          <router-link to="/" @click="logoutAndRedirect">로그아웃</router-link>
          <router-link to="#" class="button-link" @click="deleteAccount">회원탈퇴</router-link>
        </span>

        <!-- 로그인 안 된 상태 -->
        <span v-else>
          <router-link to="/signup">회원가입</router-link>
          <router-link to="/login">로그인</router-link>
        </span>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios'
import CryptoJS from 'crypto-js'

export default {
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    },
    userEmail: {
      type: String,
      default: ''
    }
  },
  computed: {
    encryptedEmail () {
      const secretKey = process.env.VUE_APP_SECRET_KEY
      return CryptoJS.AES.encrypt(this.userEmail, secretKey).toString()
    }
  },
  methods: {
    getLink (route) {
      if (this.isLoggedIn) {
        return {
          path: route,
          query: { email: this.encryptedEmail }
        }
      } else {
        return '/login'
      }
    },
    logoutAndRedirect (event) {
      event.preventDefault()
      this.$emit('logout')
    },
    async deleteAccount () {
      const email = sessionStorage.getItem('email')

      try {
        // 서버에 회원 탈퇴 요청을 보냅니다
        await axios.delete('http://localhost:3000/api/member/delete', {
          data: { email }
        })

        // 알림 표시
        alert('회원 탈퇴가 완료되었습니다.')

        // 로그아웃 후 상태 업데이트
        this.$emit('logout') // 부모 컴포넌트에서 로그인 상태를 업데이트하도록 이벤트를 발생

        // 세션 스토리지 클리어
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('email')

        // 리디렉션
        this.$router.push('/')
      } catch (error) {
        // 에러 메시지를 알림으로 표시
        alert('Error: ' + (error.response.data || error.message))
      }
    }
  }
}
</script>

<style>
nav {
  position: relative;
  width: 100%;
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  height: 80px;
  border-bottom: 1px solid #e6e6e6;
}
nav .nav-container {
  width: 1280px;
  display: flex;
  justify-content: space-between;
}
nav .nav-container .header-start,
nav .nav-container .header-center,
nav .nav-container .header-end {
  height: 50px;
}
nav .nav-container .header-start {
  margin-left: 52px;
}
nav .nav-container .header-start .project-name {
  display: inline-flex;
  align-items: center;
  height: 100%;
}
nav .nav-container .header-start .project-name span {
  margin-left: 10px;
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
  color: #000;
}
nav .nav-container .header-start .project-name img {
  height: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  object-fit: contain;
}
nav .nav-container .header-center {
  display: grid;
  margin-top: -3px;
  grid-template-columns: repeat(4, 140px);
  column-gap: 24px;
  align-items: center;
}
nav .nav-container .header-center a {
  padding: 0 10px;
  height: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  font-size: 18px;
  font-weight: lighter;
  color: #000;
}
nav .nav-container .header-center a:hover {
  background: #c9ecec;
  border-radius: 0.5rem;
}
nav .nav-container .header-end {
  display: flex;
  margin-top: -3px;
  align-items: center;
  margin-right: 52px;
}
nav .nav-container .header-end span {
  display: flex;
  column-gap: 16px;
}
nav .nav-container .header-end span a {
  text-decoration: none;
  font-size: 18px;
  font-weight: lighter;
  color: #000;
  text-align: center;
}
</style>
