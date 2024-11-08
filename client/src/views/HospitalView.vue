<template>
  <div class="hospital-list">
    <div>
      <h1>병원 정보 조회</h1>
      <p class="update-date">( 갱신 일자 : 2024년 05월 28일 )</p>
    </div>

    <!-- 지역 선택 필터 -->
    <select v-model="selectedRegion" class="region-select">
      <option value="">모든 지역</option>
      <option v-for="region in regions" :key="region" :value="region">
        {{ region }}
      </option>
    </select>

    <!-- 필터가 적용된 병원 목록 -->
    <ul>
      <li
        v-for="hospital in paginatedHospitals"
        :key="hospital.name"
        class="hospital-item"
      >
        <h2>{{ hospital.name }}</h2>
        <p><strong>Address:</strong> {{ hospital.address }}</p>
        <p><strong>Phone:</strong> {{ hospital.phone }}</p>
        <p><strong>Hours:</strong> {{ hospital.hours }}</p>
        <p><strong>Region:</strong> {{ hospital.region }}</p>
      </li>
    </ul>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button
        @click="previousPageGroup"
        :disabled="currentGroup === 1"
      >
        이전
      </button>
      <button
        v-for="page in currentPageButtons"
        :key="page"
        @click="currentPage = page"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>
      <button
        @click="nextPageGroup"
        :disabled="currentGroup === totalGroups"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import hospitalData from '@/assets/hospital.json'

// 데이터와 상태 관리
const hospitals = ref(hospitalData.hospitals || [])
const selectedRegion = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const buttonsPerGroup = 10
const currentGroup = ref(1)

// 드롭다운에 사용할 지역 목록을 계산
const regions = computed(() => {
  const uniqueRegions = new Set(hospitals.value.map((h) => h.region))
  return Array.from(uniqueRegions)
})

// 선택된 지역에 따른 병원 필터링
const filteredHospitals = computed(() => {
  return hospitals.value.filter((hospital) => {
    return (
      selectedRegion.value === '' || hospital.region === selectedRegion.value
    )
  })
})

// 페이지네이션을 위한 병원 목록 계산
const paginatedHospitals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredHospitals.value.slice(start, end)
})

// 총 페이지 수 계산
const totalPages = computed(() => {
  return Math.ceil(filteredHospitals.value.length / itemsPerPage)
})

// 총 그룹 수 계산
const totalGroups = computed(() => {
  return Math.ceil(totalPages.value / buttonsPerGroup)
})

// 현재 그룹에 표시할 페이지 번호 계산
const currentPageButtons = computed(() => {
  const start = (currentGroup.value - 1) * buttonsPerGroup + 1
  const end = Math.min(start + buttonsPerGroup - 1, totalPages.value)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// 다음 페이지 그룹으로 이동
const nextPageGroup = () => {
  if (currentGroup.value < totalGroups.value) {
    currentGroup.value++
  }
}

// 이전 페이지 그룹으로 이동
const previousPageGroup = () => {
  if (currentGroup.value > 1) {
    currentGroup.value--
  }
}
</script>

<style>
.hospital-list {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.region-select {
  margin-bottom: 20px;
  padding: 8px;
  font-size: 16px;
}

.hospital-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.hospital-item h2 {
  margin: 0;
  font-size: 1.5em;
}

.hospital-item p {
  margin: 5px 0;
}

.hospital-list .update-date {
  font-size: 14px;
}

.pagination {
  margin-top: 20px;
}

.pagination button {
  padding: 8px 12px;
  margin: 0 5px;
  font-size: 16px;
  cursor: pointer;
}

.pagination button.active {
  font-weight: bold;
  background-color: #007bff;
  color: white;
  border: none;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
