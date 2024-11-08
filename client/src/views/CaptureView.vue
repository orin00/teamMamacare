<template>
  <div>
    <h1>{{ nickname }}님의 이미지</h1>
    <!-- 가장 자주 캡처된 요일 -->
    <p v-if="mostCapturedDay">가장 자주 캡처된 요일 패턴: {{ mostCapturedDay }}</p>

    <!-- 가장 자주 캡처된 시간대 -->
    <p v-if="mostCapturedTimeRange">가장 자주 캡처된 시간대 패턴: {{ mostCapturedTimeRange }}</p>

    <!-- 가장 자주 캡처된 날짜와 횟수 -->
    <p v-if="mostCapturedDate.date">가장 많이 캡처된 날짜와 캡처 횟수: {{ mostCapturedDate.date }} {{ mostCapturedDate.day }}, 총 {{ mostCapturedDate.count }}번</p>

    <!-- 이미지 리스트 -->
    <div v-if="imagesToShow.length > 0">
      <div v-for="image in imagesToShow" :key="image.filename" class="image-container">
        <img :src="`http://localhost:3000/images${image.filename.replace('/assets', '')}`" :alt="image.filename" class="image" />
        <p class="capture-date">캡쳐 날짜: {{ formatDate(image.date) }}</p>
      </div>
    </div>
    <div v-else>
      <p>캡쳐된 이미지가 없습니다.</p>
    </div>

    <!-- 페이지네이션 파트 -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">이전</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      email: '',
      nickname: '', // 추가된 데이터 속성
      images: [],
      currentPage: 1,
      imagesPerPage: 3,
      mostCapturedDay: '',
      mostCapturedTimeRange: '',
      mostCapturedDate: { date: '', day: '', count: 0 }
    }
  },
  computed: {
    totalPages () {
      return Math.ceil(this.images.length / this.imagesPerPage)
    },
    imagesToShow () {
      const start = (this.currentPage - 1) * this.imagesPerPage
      const end = start + this.imagesPerPage
      return this.images.slice(start, end)
    }
  },
  async mounted () {
    this.getEmail()
    await this.fetchUser() // 사용자 정보를 먼저 불러옵니다
    await this.fetchImages()
    this.calculateMostCapturedDay()
    this.calculateMostCapturedTimeRange()
    this.calculateMostCapturedDate()
  },
  methods: {
    getEmail () {
      this.email = sessionStorage.getItem('email')
    },
    async fetchUser () {
      try {
        const response = await fetch(`http://localhost:3000/api/member/user?email=${this.email}`, {
          method: 'GET', // GET 메서드로 요청합니다
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          this.nickname = data.nickname // nickname을 데이터에서 가져옵니다
        } else {
          console.error('사용자 정보를 불러오는 데 실패했습니다:', response.status)
        }
      } catch (error) {
        console.error('사용자 정보 불러오기 중 오류 발생:', error)
      }
    },
    async fetchImages () {
      try {
        const response = await fetch('http://localhost:3000/api/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.email })
        })

        if (response.ok) {
          const imageList = await response.json()
          this.images = imageList
        } else {
          console.error('이미지 불러오기 실패:', response.status)
        }
      } catch (error) {
        console.error('이미지 불러오기 중 오류 발생:', error)
      }
    },
    formatDate (date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long', hour: '2-digit', minute: '2-digit' }
      return new Date(date).toLocaleDateString('ko-KR', options)
    },
    prevPage () {
      if (this.currentPage > 1) {
        this.currentPage -= 1
      }
    },
    nextPage () {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1
      }
    },
    calculateMostCapturedDay () {
      if (this.images.length === 0) return

      const dayCount = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0
      }

      this.images.forEach(image => {
        const date = new Date(image.date)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
        if (dayCount[dayName] !== undefined) {
          dayCount[dayName]++
        }
      })

      // 가장 자주 캡처된 요일 찾기
      const mostCapturedDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b)

      // 요일 이름을 한국어로 변환
      const dayTranslations = {
        Sunday: '일요일',
        Monday: '월요일',
        Tuesday: '화요일',
        Wednesday: '수요일',
        Thursday: '목요일',
        Friday: '금요일',
        Saturday: '토요일'
      }

      this.mostCapturedDay = dayTranslations[mostCapturedDay] || ''
    },
    calculateMostCapturedTimeRange () {
      if (this.images.length === 0) return

      const timeCount = Array(24).fill(0) // 시간대별 카운트를 위한 배열

      this.images.forEach(image => {
        const date = new Date(image.date)
        const hour = date.getHours()
        timeCount[hour]++
      })

      // 가장 자주 캡처된 시간대 찾기
      let maxCount = 0
      let startHour = 0
      for (let i = 0; i < timeCount.length; i++) {
        if (timeCount[i] > maxCount) {
          maxCount = timeCount[i]
          startHour = i
        }
      }

      // 시간대 계산
      const endHour = (startHour + 1) % 24
      this.mostCapturedTimeRange = `${startHour}시 ~ ${endHour}시`
    },
    calculateMostCapturedDate () {
      if (this.images.length === 0) return

      const dateCount = {}

      this.images.forEach(image => {
        const date = new Date(image.date)
        const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        const dayName = date.toLocaleDateString('ko-KR', { weekday: 'long' })
        const key = `${formattedDate} (${dayName})`
        dateCount[key] = (dateCount[key] || 0) + 1
      })

      // 가장 자주 캡처된 날짜 찾기
      const mostCapturedDate = Object.keys(dateCount).reduce((a, b) => dateCount[a] > dateCount[b] ? a : b)

      // 날짜와 횟수 분리
      const [datePart, dayPart] = mostCapturedDate.split(' (')
      const count = dateCount[mostCapturedDate]

      this.mostCapturedDate = {
        date: datePart + (dayPart ? '' : ''),
        day: dayPart ? dayPart.replace(')', '') : '',
        count: count
      }
    }
  }
}

</script>

<style scoped>
.image-container {
  margin-bottom: 20px;
}
.image {
  max-width: 100%;
  height: auto;
}
.capture-date {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.pagination button {
  margin: 0 10px;
}
</style>
