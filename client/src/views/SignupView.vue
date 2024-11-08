<template>
    <div>
      <h2>Sign Up</h2>
      <form @submit.prevent="signUp">
        <div>
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <div>
          <label for="nickname">Nickname:</label>
          <input type="text" v-model="nickname" required />
        </div>
        <button type="submit">Sign Up</button>
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
      nickname: '',
      message: ''
    }
  },
  methods: {
    async signUp () {
      try {
        const response = await axios.post('http://localhost:3000/api/member/signup', {
          email: this.email,
          password: this.password,
          nickname: this.nickname
        })
        this.message = response.data
        this.$router.push('/')
      } catch (error) {
        this.message = 'Error: ' + (error.response.data || error.message)
      }
    }
  }
}
</script>
