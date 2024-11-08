<template>
  <div id="app">
    <section v-if="shouldActivateWebcam" style="position: relative; width: 100%; height: 100%">
      <div style="width: 700px; left: 17%; right: 17%; position: relative">
        <video ref="video" style="position: absolute" autoplay></video>
        <canvas ref="canvas" style="position: relative"></canvas>
      </div>
    </section>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'
import axios from 'axios'

export default {
  data () {
    return {
      video: null,
      canvas: null,
      context: null,
      model: null,
      faceDetectionTimeout: null,
      lastFaceDetectedTime: null,
      animationFrameId: null,
      email: sessionStorage.getItem('email') || '',
      isCapturing: false,
      shouldActivateWebcam: false,
      isWebcamActive: false // 웹캠 상태 추적 변수 추가
    }
  },
  async mounted () {
    const token = sessionStorage.getItem('token')
    if (!token || !this.email) {
      this.$router.push('/login')
      return
    }

    if (this.$route.path !== '/stat') {
      this.shouldActivateWebcam = true
      try {
        await tf.setBackend('webgl')
        await tf.ready()

        this.video = this.$refs.video
        this.canvas = this.$refs.canvas
        this.context = this.canvas.getContext('2d')
        this.model = Object.freeze(await blazeface.load())

        this.startWebCam()
        window.addEventListener('resize', this.adjustCanvasSize)
        window.addEventListener('beforeunload', this.handleBeforeUnload)
      } catch (error) {
        console.error('Error setting up TensorFlow.js backend:', error)
      }
    }
  },
  beforeRouteLeave (to, from, next) {
    this.stopFaceDetection()
    next()
  },
  beforeUnmount () {
    this.stopFaceDetection()
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },
  methods: {
    async startWebCam () {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        this.video.srcObject = stream
        this.isWebcamActive = true // 웹캠이 활성화되었음을 표시

        this.video.addEventListener('loadeddata', () => {
          this.adjustCanvasSize()
          this.lastFaceDetectedTime = Date.now()
          this.detectFaces()
        })

        this.video.addEventListener('ended', () => {
          this.isWebcamActive = false // 웹캠이 종료되었음을 표시
        })
      } catch (error) {
        console.error('Error accessing webcam:', error)
        this.isWebcamActive = false // 웹캠 액세스 실패 시 비활성화
      }
    },
    async detectFaces () {
      if (!this.model || !this.isWebcamActive) return // 웹캠이 비활성화되면 얼굴 인식 중지

      const returnTensors = false
      const predictions = await this.model.estimateFaces(this.video, returnTensors)
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

      if (predictions.length > 0) {
        this.lastFaceDetectedTime = Date.now()
        this.isCapturing = false

        const probability = predictions[0].probability[0]
        if (probability >= 0.998) {
          this.resetFaceDetectionTimer()

          const start = predictions[0].topLeft
          const end = predictions[0].bottomRight
          const size = [end[0] - start[0], end[1] - start[1]]

          this.context.beginPath()
          this.context.rect(start[0], start[1], size[0], size[1])
          this.context.lineWidth = 2
          this.context.strokeStyle = 'red'
          this.context.stroke()

          const text = `Probability: ${(probability * 100).toFixed(2)}%`
          this.context.fillStyle = '#ffffff'
          this.context.font = '16px Arial'
          this.context.fillText(text, start[0] + 5, start[1] + 20)

          try {
            await axios.post('http://localhost:3000/api/detect/face-data', {
              probability: probability
            })
          } catch (error) {
            console.error('Error sending face data:', error)
          }
        }
      } else if (this.lastFaceDetectedTime && (Date.now() - this.lastFaceDetectedTime) > 5000 && !this.isCapturing && this.isWebcamActive) {
        this.isCapturing = true
        const imageUrl = await this.captureImage()
        this.lastFaceDetectedTime = Date.now()
        await this.sendAlertEmail(imageUrl)
      }

      this.animationFrameId = requestAnimationFrame(this.detectFaces)
    },
    async captureImage () {
      this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
      const imageData = this.canvas.toDataURL('image/png')

      try {
        const base64Image = imageData.split(',')[1]

        const response = await axios.post('http://localhost:3000/api/detect/save-capture', {
          image: base64Image,
          email: this.email
        })

        return response.data.imageUrl
      } catch (error) {
        console.error('Error saving captured image:', error)
      }
    },
    async sendAlertEmail (imageUrl) {
      try {
        await axios.post('http://localhost:3000/api/alert/send-alert', {
          email: this.email,
          imageUrl: imageUrl
        })
      } catch (error) {
        console.error('Error sending alert email:', error)
      }
    },
    resetFaceDetectionTimer () {
      clearTimeout(this.faceDetectionTimeout)
    },
    adjustCanvasSize () {
      if (this.video && this.video.videoWidth) {
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight
      }
    },
    stopFaceDetection () {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
      if (this.video && this.video.srcObject) {
        const stream = this.video.srcObject
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
      }
      clearTimeout(this.faceDetectionTimeout)
      this.isWebcamActive = false // 웹캠 비활성화 상태로 변경
    },
    handleBeforeUnload (event) {
      this.stopFaceDetection()
    }
  }
}

</script>

<style scoped>
video,
canvas {
  position: absolute;
  width: 1280px;
  height: 960px;
  border: 2px solid black;
  border-radius: 5px;
  box-shadow: rgba(25, 25, 25, 0.04) 0 0 2px 0, rgba(0, 0, 0, 0.1) 0 5px 8px 0;
}
</style>
