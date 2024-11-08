<template>
  <div id="app">
    <p>아기의 호흡 여부를 확인한 후, 아기가 호흡을 하지 않는 상태라면 다음 영상을 참고하여 CPR을 진행하십시오</p>

    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/vQn05g0_4Zk?si=hzc8XRFhVGwMVTq2"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>

    <p>영상 출처 : <a href="https://www.youtube.com/watch?v=vQn05g0_4Zk">https://www.youtube.com/watch?v=vQn05g0_4Zk</a></p>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      sampleData: ''
    }
  },
  created () {},
  mounted () {},
  unmounted () {},
  methods: {}
}
</script>

<style>
</style>
