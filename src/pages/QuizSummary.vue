<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { quizStore } from '../stores/quizStore'

const router = useRouter()

onMounted(() => {
  if (!quizStore.quizData) {
    router.push('/')
  }
})

const percentage = computed(() => {
  if (quizStore.maxScore === 0) return 0
  return Math.round((quizStore.totalScore / quizStore.maxScore) * 100)
})

const resultMessage = computed(() => {
  if (percentage.value >= 90) return { text: 'OUTSTANDING!', color: 'text-green-400', bg: 'bg-green-500' }
  if (percentage.value >= 70) return { text: 'GREAT JOB!', color: 'text-green-400', bg: 'bg-green-500' }
  if (percentage.value >= 50) return { text: 'GOOD EFFORT!', color: 'text-yellow-400', bg: 'bg-yellow-500' }
  return { text: 'KEEP TRYING!', color: 'text-red-400', bg: 'bg-red-500' }
})

function restartQuiz() {
  quizStore.currentQuestionIndex = 0
  quizStore.answers = []
  router.push('/quiz')
}

function goHome() {
  quizStore.reset()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8" v-if="quizStore.quizData">
    <div class="max-w-2xl w-full">
      <!-- Summary Card -->
      <div class="card text-center">
        <!-- Hash Badge -->
        <div class="inline-block bg-gray-900 border-4 border-gray-600 px-4 py-2 mb-6 font-mono text-base">
          ID: <span class="text-yellow-400">{{ quizStore.quizHash }}</span>
        </div>
        
        <h1 class="text-2xl sm:text-3xl pixel-text text-yellow-400 mb-2">QUIZ COMPLETE!</h1>
        <p class="text-lg mb-8" :class="resultMessage.color">
          {{ resultMessage.text }}
        </p>
        
        <!-- Score Display - Single Card -->
        <div class="bg-gray-900 border-8 border-gray-700 p-8 mb-8 inline-block min-w-48">
          <p class="text-6xl sm:text-7xl pixel-text" :class="resultMessage.color">
            {{ percentage }}%
          </p>
          <p class="text-gray-400 mt-4 text-base">
            {{ quizStore.totalScore }} / {{ quizStore.maxScore }} POINTS
          </p>
        </div>
        
        <!-- Progress Bar -->
        <div class="h-6 bg-gray-700 mb-8 border-4 border-gray-600">
          <div 
            class="h-full transition-all duration-500"
            :class="resultMessage.bg"
            :style="{ width: `${percentage}%` }"
          ></div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="restartQuiz" class="btn btn-primary font-bold">
            TRY AGAIN
          </button>
          <button @click="goHome" class="btn btn-secondary">
            NEW QUIZ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
