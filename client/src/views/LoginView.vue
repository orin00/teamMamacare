<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      email: '',
      password: '',
      message: ''
    }
  },
  methods: {
    async login () {
      try {
        const response = await axios.post('http://localhost:3000/api/member/login', {
          email: this.email,
          password: this.password
        })

        // 로그인 성공 시 토큰과 이메일 저장
        const token = response.data.token
        this.$emit('login-success', token)

        // sessionStorage에 토큰과 이메일 저장
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('email', this.email) // 이메일 저장

        // 로그인 후 항상 홈('/')으로 리디렉션
        this.$router.push('/')
      } catch (error) {
        // 개선된 오류 메시지 처리
        if (error.response && error.response.data) {
          this.message = `Error: ${error.response.data.message || error.response.data}`
        } else {
          this.message = `Error: ${error.message}`
        }
      }
    }
  }
}
</script>
