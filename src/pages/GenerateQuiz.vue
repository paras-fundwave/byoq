<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { encodeQuizCode, validateQuizJson } from '../utils/quizCodec'

const router = useRouter()

const jsonInput = ref('')
const copied = ref(false)
const templateCopied = ref(false)

const sampleJson = {
  title: "Sample Quiz",
  description: "A sample quiz to demonstrate the format",
  quiz: [
    {
      question: "What is 2 + 2?",
      skippable: false,
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
              <p class="text-gray-400 text-base">{{ parsedData.quiz.length }} QUESTION(S)</p>
              
              <div v-for="(q, i) in parsedData.quiz.slice(0, 3)" :key="i" class="p-4 bg-gray-700/50 border-4 border-gray-600">
                <p class="text-base">{{ i + 1 }}. {{ q.question }}</p>
                <div class="flex gap-2 mt-3">
                  <span v-if="q.weight" class="badge bg-yellow-600 border-yellow-800">WT: {{ q.weight }}</span>
                  <span v-if="q.skippable === false" class="badge bg-red-600 border-red-800">REQ</span>
                  <span v-if="q.hint" class="badge bg-blue-600 border-blue-800">HINT</span>
                </div>
              </div>
              
              <p v-if="parsedData.quiz.length > 3" class="text-gray-500 text-base">
                +{{ parsedData.quiz.length - 3 }} more...
              </p>
            </div>
            
            <!-- Generated Code Section (moved inside preview when valid) -->
            <div v-if="isValid" class="mt-8 pt-6 border-t-4 border-gray-600">
              <h3 class="text-lg mb-4 text-yellow-400">QUIZ CODE</h3>
              <div class="bg-gray-900 border-4 border-gray-600 p-4 font-mono text-sm break-all max-h-32 overflow-y-auto">
                {{ generatedCode }}
              </div>
              <button @click="copyCode" class="btn btn-success mt-4 w-full">
                {{ copied ? '✓ COPIED!' : 'COPY CODE' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
