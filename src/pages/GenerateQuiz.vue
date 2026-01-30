<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { encodeQuizCode, validateQuizJson } from '../utils/quizCodec'

const router = useRouter()

const jsonInput = ref('')
const copied = ref(false)
const linkCopied = ref(false)
const templateCopied = ref(false)
const previewStartIndex = ref(0)

const sampleJson = {
  title: "Sample Quiz",
  description: "A sample quiz to demonstrate the format",
  quiz: [
    {
      question: "What is 2 + 2?",
      weight: 1,
      answerOptions: [
        { text: "3", rationale: "Incorrect. 2 + 2 equals 4, not 3.", isCorrect: false },
        { text: "4", rationale: "Correct! 2 + 2 equals 4.", isCorrect: true },
        { text: "5", rationale: "Incorrect. 2 + 2 equals 4, not 5.", isCorrect: false }
      ],
      hint: "Think about basic addition"
    }
  ]
}

const placeholder = JSON.stringify(sampleJson, null, 2)

const parsedData = computed(() => {
  if (!jsonInput.value.trim()) return null
  try {
    return JSON.parse(jsonInput.value)
  } catch {
    return null
  }
})

const parseError = computed(() => {
  if (!jsonInput.value.trim()) return null
  try {
    JSON.parse(jsonInput.value)
    return null
  } catch (e) {
    return e.message
  }
})

const validationErrors = computed(() => {
  if (!parsedData.value) return []
  return validateQuizJson(parsedData.value)
})

const isValid = computed(() => {
  return parsedData.value && validationErrors.value.length === 0
})

const generatedCode = computed(() => {
  if (!isValid.value) return ''
  return encodeQuizCode(parsedData.value)
})

const generatedLink = computed(() => {
  if (!generatedCode.value) return ''
  const baseUrl = window.location.origin + import.meta.env.BASE_URL
  return `${baseUrl}?code=${generatedCode.value}`
})

const codePreview = computed(() => {
  if (!generatedCode.value) return ''
  const code = generatedCode.value
  if (code.length <= 60) return code
  return code.substring(0, 30) + '...' + code.substring(code.length - 20)
})

const previewQuestions = computed(() => {
  if (!parsedData.value?.quiz) return []
  return parsedData.value.quiz.slice(previewStartIndex.value, previewStartIndex.value + 2)
})

const canGoPrevPreview = computed(() => previewStartIndex.value > 0)
const canGoNextPreview = computed(() => {
  if (!parsedData.value?.quiz) return false
  return previewStartIndex.value + 2 < parsedData.value.quiz.length
})

function prevPreview() {
  if (canGoPrevPreview.value) {
    previewStartIndex.value = Math.max(0, previewStartIndex.value - 2)
  }
}

function nextPreview() {
  if (canGoNextPreview.value) {
    previewStartIndex.value += 2
  }
}

async function copyTemplate() {
  await navigator.clipboard.writeText(placeholder)
  templateCopied.value = true
  setTimeout(() => templateCopied.value = false, 2000)
}

async function copyCode() {
  if (!generatedCode.value) return
  await navigator.clipboard.writeText(generatedCode.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

async function copyLink() {
  if (!generatedLink.value) return
  await navigator.clipboard.writeText(generatedLink.value)
  linkCopied.value = true
  setTimeout(() => linkCopied.value = false, 2000)
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8">
    <div class="w-full max-w-7xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <button @click="goBack" class="btn btn-secondary">
          ← BACK
        </button>
        <h1 class="text-xl sm:text-2xl pixel-text text-yellow-400">CREATE QUIZ</h1>
        <div class="w-28"></div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- JSON Input -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg text-yellow-400">QUIZ JSON</h2>
            <button @click="copyTemplate" class="btn btn-secondary text-sm py-2 px-4">
              {{ templateCopied ? '✓ COPIED!' : 'COPY TEMPLATE' }}
            </button>
          </div>
          <textarea
            v-model="jsonInput"
            class="input h-[500px] resize-none"
            :placeholder="placeholder"
          ></textarea>
          
          <!-- Errors -->
          <div v-if="parseError" class="mt-4 p-4 bg-red-900/30 border-4 border-red-700">
            <p class="text-red-400 text-base">JSON PARSE ERROR:</p>
            <p class="text-red-300 text-sm mt-1">{{ parseError }}</p>
          </div>
          
          <div v-else-if="validationErrors.length > 0" class="mt-4 p-4 bg-yellow-900/30 border-4 border-yellow-700">
            <p class="text-yellow-400 text-base">VALIDATION ERRORS:</p>
            <ul class="text-yellow-300 text-sm mt-1 list-disc list-inside">
              <li v-for="err in validationErrors" :key="err">{{ err }}</li>
            </ul>
          </div>
        </div>

        <!-- Preview -->
        <div class="card">
          <h2 class="text-lg mb-4 text-yellow-400">PREVIEW</h2>
          
          <div v-if="!jsonInput.trim()" class="text-gray-500 text-center py-32 text-base">
            Enter JSON to see preview
          </div>
          
          <div v-else-if="parseError" class="text-gray-500 text-center py-32 text-base">
            Fix JSON errors to see preview
          </div>
          
          <div v-else-if="parsedData" class="space-y-6">
            <!-- Quiz Info -->
            <div>
              <h3 class="text-xl text-yellow-400">{{ parsedData.title || 'Untitled Quiz' }}</h3>
              <p v-if="parsedData.description" class="text-gray-400 mt-2 text-base leading-relaxed">{{ parsedData.description }}</p>
              <p v-if="parsedData.caption" class="text-gray-500 text-sm mt-1 italic">{{ parsedData.caption }}</p>
            </div>
            
            <!-- Questions Preview -->
            <div v-if="parsedData.quiz?.length" class="space-y-4">
              <div class="flex items-center justify-between">
                <p class="text-gray-400 text-base">{{ parsedData.quiz.length }} QUESTION(S)</p>
                <div class="flex gap-2">
                  <button 
                    @click="prevPreview" 
                    :disabled="!canGoPrevPreview"
                    class="btn btn-secondary py-2 px-4 text-sm"
                    name="prev-preview-button"
                  >
                    ←
                  </button>
                  <button 
                    @click="nextPreview" 
                    :disabled="!canGoNextPreview"
                    class="btn btn-secondary py-2 px-4 text-sm"
                    name="next-preview-button"
                  >
                    →
                  </button>
                </div>
              </div>
              
              <div v-for="(q, i) in previewQuestions" :key="previewStartIndex + i" class="p-4 bg-gray-700/50 border-4 border-gray-600">
                <p class="text-base">{{ previewStartIndex + i + 1 }}. {{ q.question }}</p>
                <div class="flex gap-2 mt-3">
                  <span v-if="q.weight" class="badge bg-yellow-600 border-yellow-800">WT: {{ q.weight }}</span>
                  <span v-if="q.hint" class="badge bg-blue-600 border-blue-800">HINT</span>
                </div>
              </div>
              
              <p v-if="parsedData.quiz.length > 2" class="text-gray-500 text-sm text-center">
                Showing {{ previewStartIndex + 1 }}-{{ Math.min(previewStartIndex + 2, parsedData.quiz.length) }} of {{ parsedData.quiz.length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Code Section - Compact Row -->
      <div v-if="isValid" class="card mt-8">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div class="flex-1 bg-gray-900 border-4 border-gray-600 px-4 py-3 font-mono text-sm text-gray-400 truncate">
            {{ codePreview }}
          </div>
          <div class="flex gap-4">
            <button @click="copyCode" class="btn btn-success flex-1 sm:flex-none">
              {{ copied ? '✓ COPIED!' : 'COPY CODE' }}
            </button>
            <button @click="copyLink" class="btn btn-primary flex-1 sm:flex-none">
              {{ linkCopied ? '✓ COPIED!' : 'COPY LINK' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
