<template>
  <div id="app">
    <NavBar :isLoggedIn="isLoggedIn" :userEmail="userEmail" @logout="handleLogout" />
    <router-view @login-success="handleLogin" />
    <Footer />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import Footer from './components/FooterParts.vue'

export default {
  components: {
    NavBar,
    Footer
  },
  data () {
    return {
      isLoggedIn: false,
      userEmail: null // Store the user's email
    }
  },
  methods: {
    handleLogin (token, email) {
      this.isLoggedIn = true
      this.userEmail = email // 로그인 시 이메일 정보 처리
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('email', email) // 세션 스토리지에 이메일 저장
      this.$router.push('/')
    },
    handleLogout () {
      this.isLoggedIn = false
      this.userEmail = null // 로그아웃 시 이메일 정보 처리
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('email') // 세션 스토리지에 이메일 삭제
      this.$router.push('/')
    }
  },
  mounted () {
    // 세션 스토리지에서 로그인 상태와 이메일 정보를 가져와서 상태를 설정
    if (sessionStorage.getItem('token')) {
      this.isLoggedIn = true
      this.userEmail = sessionStorage.getItem('email')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  margin: 0;
}
</style>
