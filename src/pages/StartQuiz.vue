<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { quizStore } from '../stores/quizStore'
import { generateHash } from '../utils/quizCodec'

const router = useRouter()

onMounted(async () => {
  if (!quizStore.quizData) {
    router.push('/')
    return
  }
  
  const hash = await generateHash(quizStore.quizData)
  quizStore.setHash(hash)
  quizStore.saveToHistory()
})

function startQuiz() {
  quizStore.currentQuestionIndex = 0
  router.push('/quiz')
}

function goBack() {
  quizStore.reset()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8">
    <div class="max-w-2xl w-full" v-if="quizStore.quizData">
      <!-- Quiz Info Card -->
      <div class="card text-center">
        <!-- Hash Badge -->
        <div class="inline-block bg-gray-900 border-4 border-gray-600 px-4 py-2 mb-6 font-mono text-base">
          ID: <span class="text-yellow-400">{{ quizStore.quizHash }}</span>
        </div>
        
        <h1 class="text-2xl sm:text-3xl pixel-text text-yellow-400 mb-4 leading-relaxed">
          {{ quizStore.quizData.title }}
        </h1>
        
        <p v-if="quizStore.quizData.description" class="text-gray-300 text-base mb-4 leading-relaxed">
          {{ quizStore.quizData.description }}
        </p>
        
        <p v-if="quizStore.quizData.caption" class="text-gray-500 italic text-sm mb-8">
          {{ quizStore.quizData.caption }}
        </p>
        
        <!-- Quiz Stats -->
        <div class="flex justify-center gap-8 mb-8">
          <div class="text-center bg-gray-900 border-4 border-gray-700 p-4 min-w-24">
            <p class="text-3xl text-white">{{ quizStore.totalQuestions }}</p>
            <p class="text-gray-400 text-sm mt-1">QUESTIONS</p>
          </div>
          <div class="text-center bg-gray-900 border-4 border-gray-700 p-4 min-w-24">
            <p class="text-3xl text-white">{{ quizStore.maxScore }}</p>
            <p class="text-gray-400 text-sm mt-1">MAX SCORE</p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="startQuiz" class="btn btn-primary">
            START QUIZ
          </button>
          <button @click="goBack" class="btn btn-secondary">
            ← BACK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
