<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { decodeQuizCode } from '../utils/quizCodec'
import { quizStore } from '../stores/quizStore'

const router = useRouter()
const route = useRoute()
const quizCode = ref('')
const error = ref('')

const pastQuizzes = computed(() => quizStore.getPastQuizzes())

onMounted(() => {
  // Check if code is in URL query param
  const code = route.query.code
  if (code) {
    quizCode.value = code
    loadQuiz()
  }
})

function loadQuiz() {
  error.value = ''
  if (!quizCode.value.trim()) {
    error.value = 'Please enter a quiz code'
    return
  }
  
  const data = decodeQuizCode(quizCode.value.trim())
  if (!data) {
    error.value = 'Invalid quiz code. Please check and try again.'
    return
  }
  
  quizStore.setQuiz(data, quizCode.value.trim())
  router.push('/start')
}

function loadPastQuiz(quiz) {
  quizCode.value = quiz.code
  loadQuiz()
}

function removePastQuiz(hash) {
  quizStore.removePastQuiz(hash)
}

function goToGenerate() {
  router.push('/generate')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8">
    <div class="max-w-2xl w-full">
      <!-- Logo/Title -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="text-4xl sm:text-6xl pixel-text text-yellow-400 tracking-tight mb-4">
          BYOQ
        </h1>
        <p class="text-gray-400 text-lg leading-relaxed">Bring Your Own Quiz</p>
      </div>

      <!-- Main Card -->
      <div class="card">
        <h2 class="text-lg sm:text-xl mb-6 text-center text-yellow-400">START A QUIZ</h2>
        
        <!-- Quiz Code Input -->
        <div class="mb-6">
          <label class="block text-gray-400 mb-2 text-base">ENTER QUIZ CODE</label>
          <textarea
            v-model="quizCode"
            class="input h-28 resize-none"
            placeholder="Paste your quiz code here..."
            @keydown.ctrl.enter="loadQuiz"
          ></textarea>
          <p v-if="error" class="text-red-400 mt-2 text-base">{{ error }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button @click="loadQuiz" class="btn btn-primary flex-1">
            START
          </button>
          <button @click="goToGenerate" class="btn btn-secondary flex-1">
            CREATE
          </button>
        </div>
      </div>

      <!-- Past Quizzes -->
      <div v-if="pastQuizzes.length > 0" class="card mt-8">
        <h2 class="text-lg mb-4 text-yellow-400">PAST QUIZZES</h2>
        <div class="space-y-3">
          <div 
            v-for="quiz in pastQuizzes" 
            :key="quiz.hash"
            class="flex items-center justify-between bg-gray-900 border-4 border-gray-700 p-3 hover:border-yellow-500 transition-colors"
          >
            <div class="flex-1 cursor-pointer" @click="loadPastQuiz(quiz)">
              <p class="text-base text-white truncate">{{ quiz.title }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ quiz.questionCount }} Q's • #{{ quiz.hash }}
              </p>
            </div>
            <button 
              @click.stop="removePastQuiz(quiz.hash)"
              class="text-red-400 hover:text-red-300 ml-4 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-gray-600 mt-8 text-sm">
        No account needed. Your quiz, your rules.
      </p>
    </div>
  </div>
</template>
