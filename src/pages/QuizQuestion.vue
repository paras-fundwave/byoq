<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { quizStore } from '../stores/quizStore'

const router = useRouter()

const selectedOption = ref(null)
const showExplanations = ref(false)
const showHint = ref(false)

onMounted(() => {
  if (!quizStore.quizData) {
    router.push('/')
    return
  }
  
  resetQuestionState()
})

// Watch for question changes
watch(() => quizStore.currentQuestionIndex, () => {
  resetQuestionState()
})

const currentQuestion = computed(() => {
  return quizStore.quizData?.quiz?.[quizStore.currentQuestionIndex]
})

const isAnswered = computed(() => selectedOption.value !== null)

const canGoNext = computed(() => {
  return quizStore.currentQuestionIndex < quizStore.totalQuestions - 1
})

const canGoPrev = computed(() => quizStore.currentQuestionIndex > 0)

const isLastQuestion = computed(() => {
  return quizStore.currentQuestionIndex >= quizStore.totalQuestions - 1
})

const allQuestionsAnswered = computed(() => {
  return quizStore.answers.length === quizStore.totalQuestions
})

const unansweredCount = computed(() => {
  return quizStore.totalQuestions - quizStore.answers.length
})

function selectOption(index) {
  if (isAnswered.value) return // Can't change answer
  
  selectedOption.value = index
  const isCorrect = currentQuestion.value.answerOptions[index].isCorrect
  quizStore.recordAnswer(quizStore.currentQuestionIndex, index, isCorrect)
}

function getOptionClass(index) {
  if (!isAnswered.value) {
    return ''
  }
  
  const option = currentQuestion.value.answerOptions[index]
  if (option.isCorrect) {
    return 'correct'
  }
  if (index === selectedOption.value && !option.isCorrect) {
    return 'incorrect'
  }
  return 'disabled'
}

function toggleExplanations() {
  showExplanations.value = !showExplanations.value
}

function toggleHint() {
  showHint.value = !showHint.value
}

function goNext() {
  if (!canGoNext.value) return
  quizStore.currentQuestionIndex++
}

function goPrev() {
  if (!canGoPrev.value) return
  quizStore.currentQuestionIndex--
}

function resetQuestionState() {
  const existing = quizStore.getAnswer(quizStore.currentQuestionIndex)
  if (existing) {
    selectedOption.value = existing.selectedOptionIndex
  } else {
    selectedOption.value = null
  }
  showExplanations.value = false
  showHint.value = false
}

function finishQuiz() {
  if (!allQuestionsAnswered.value) return
  router.push('/summary')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8" v-if="currentQuestion">
    <div class="max-w-4xl w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <span class="text-gray-400 text-base">
            Q{{ quizStore.currentQuestionIndex + 1 }}/{{ quizStore.totalQuestions }}
          </span>
          <span v-if="currentQuestion.weight > 1" class="badge bg-yellow-600 border-yellow-800">
            {{ currentQuestion.weight }}x
          </span>
        </div>
        <div class="bg-gray-800 border-4 border-gray-600 px-3 py-2 font-mono text-base">
          <span class="text-gray-400">ID:</span>
          <span class="text-yellow-400 ml-1">{{ quizStore.quizHash }}</span>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="h-4 bg-gray-700 mb-8 border-4 border-gray-600">
        <div 
          class="h-full bg-yellow-500 transition-all duration-300"
          :style="{ width: `${((quizStore.currentQuestionIndex + 1) / quizStore.totalQuestions) * 100}%` }"
        ></div>
      </div>

      <!-- Question Card -->
      <div class="card mb-6">
        <p v-if="currentQuestion.caption" class="text-gray-500 text-base mb-2 italic">
          {{ currentQuestion.caption }}
        </p>
        <h2 class="text-sm sm:text-base text-white leading-relaxed">
          {{ currentQuestion.question }}
        </h2>
        
        <!-- Hint Toggle Button -->
        <button 
          v-if="currentQuestion.hint && !isAnswered"
          @click="toggleHint"
          class="mt-4 text-base text-blue-400 hover:text-blue-300 underline"
        >
          {{ showHint ? '🔒 HIDE HINT' : '💡 SHOW HINT' }}
        </button>
        
        <!-- Hint Content -->
        <div v-if="currentQuestion.hint && showHint && !isAnswered" class="mt-3 p-3 bg-blue-900/30 border-4 border-blue-700">
          <span class="text-blue-300 text-base">{{ currentQuestion.hint }}</span>
        </div>
      </div>

      <!-- Options -->
      <div class="space-y-4 mb-8">
        <div
          v-for="(option, index) in currentQuestion.answerOptions"
          :key="index"
          @click="selectOption(index)"
          class="option-card"
          :class="getOptionClass(index)"
        >
          <div class="flex items-start gap-4">
            <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-700 border-4 border-gray-600 text-base">
              {{ String.fromCharCode(65 + index) }}
            </span>
            <div class="flex-1">
              <p class="text-base leading-relaxed">{{ option.text }}</p>
              
              <!-- Show rationale for selected wrong answer or correct answer -->
              <p 
                v-if="isAnswered && (showExplanations || index === selectedOption || option.isCorrect)"
                class="mt-2 text-base leading-relaxed text-gray-400"
              >
                {{ option.rationale }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-4 justify-between">
        <div class="flex gap-4">
          <button 
            v-if="isAnswered"
            @click="toggleExplanations" 
            class="btn btn-secondary text-base"
          >
            {{ showExplanations ? 'HIDE' : 'SHOW' }} EXPLANATIONS
          </button>
        </div>
        
        <div class="flex gap-4">
          <button 
            @click="goPrev" 
            :disabled="!canGoPrev"
            class="btn btn-secondary"
          >
            ←
          </button>
          
          <button 
            v-if="!isLastQuestion"
            @click="goNext" 
            class="btn btn-primary font-bold"
          >
            NEXT →
          </button>
          
          <button 
            v-else
            @click="finishQuiz"
            :disabled="!allQuestionsAnswered"
            class="btn btn-success font-bold"
          >
            FINISH
          </button>
        </div>
      </div>

      <!-- Unanswered Warning -->
      <p v-if="isLastQuestion && !allQuestionsAnswered" class="text-yellow-400 text-base mt-4 text-center">
        ⚠️ {{ unansweredCount }} question(s) unanswered. Answer all to finish.
      </p>
    </div>
  </div>
</template>
