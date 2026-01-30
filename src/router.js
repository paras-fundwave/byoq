import { createRouter, createWebHistory } from 'vue-router'
import Landing from './pages/Landing.vue'
import GenerateQuiz from './pages/GenerateQuiz.vue'
import StartQuiz from './pages/StartQuiz.vue'
import QuizQuestion from './pages/QuizQuestion.vue'
import QuizSummary from './pages/QuizSummary.vue'

const routes = [
  { path: '/', name: 'landing', component: Landing },
  { path: '/generate', name: 'generate', component: GenerateQuiz },
  { path: '/start', name: 'start', component: StartQuiz },
  { path: '/quiz', name: 'quiz', component: QuizQuestion },
  { path: '/summary', name: 'summary', component: QuizSummary },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
