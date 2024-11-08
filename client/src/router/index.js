import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CryptoJS from 'crypto-js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/cam',
    name: 'cam',
    component: () => import(/* webpackChunkName: "cam" */ '../views/CamView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/capture',
    name: 'capture',
    component: () => import(/* webpackChunkName: "capture" */ '../views/CaptureView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import(/* webpackChunkName: "signup" */ '../views/SignupView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/LoginView.vue')
  },
  {
    path: '/hospital',
    name: 'hospital',
    component: () => import(/* webpackChunkName: "hospital" */ '../views/HospitalView.vue')
  },
  {
    path: '/cpr',
    name: 'cpr',
    component: () => import(/* webpackChunkName: "cpr" */ '../views/CprView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      handleCamRoute(to, next)
    }
  } else {
    next()
  }
})

function handleCamRoute (to, next) {
  if (to.name === 'cam' && !to.query.email) {
    const secretKey = process.env.VUE_APP_SECRET_KEY // 환경 변수에서 비밀 키 가져오기
    const encryptedEmail = sessionStorage.getItem('email')

    if (encryptedEmail) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedEmail, secretKey)
        const userEmail = bytes.toString(CryptoJS.enc.Utf8)

        if (userEmail) {
          next({ name: 'cam', query: { email: userEmail } })
        } else {
          next('/') // 이메일 복호화 실패 시 홈으로 리디렉션
        }
      } catch (error) {
        console.error('Error decrypting email:', error)
        next('/')
      }
    } else {
      next('/') // 암호화된 이메일이 없으면 홈으로 리디렉션
    }
  } else {
    next()
  }
}

export default router
