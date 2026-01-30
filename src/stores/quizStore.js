import { reactive } from 'vue'

const STORAGE_KEY = 'byoq_past_quizzes'

export const quizStore = reactive({
  quizData: null,
  currentQuestionIndex: 0,
  answers: [], // { questionIndex, selectedOptionIndex, isCorrect }
  quizHash: '',
  quizCode: '',
  
  setQuiz(data, code = '') {
    this.quizData = data
    this.currentQuestionIndex = 0
    this.answers = []
    this.quizHash = ''
    this.quizCode = code
  },
  
  setHash(hash) {
    this.quizHash = hash
  },
  
  recordAnswer(questionIndex, selectedOptionIndex, isCorrect) {
    const existing = this.answers.find(a => a.questionIndex === questionIndex)
    if (existing) {
      existing.selectedOptionIndex = selectedOptionIndex
      existing.isCorrect = isCorrect
    } else {
      this.answers.push({ questionIndex, selectedOptionIndex, isCorrect })
    }
  },
  
  getAnswer(questionIndex) {
    return this.answers.find(a => a.questionIndex === questionIndex)
  },
  
  get totalQuestions() {
    return this.quizData?.quiz?.length || 0
  },
  
  get correctAnswers() {
    return this.answers.filter(a => a.isCorrect).length
  },
  
  get totalScore() {
    if (!this.quizData?.quiz) return 0
    return this.answers.reduce((sum, a) => {
      if (a.isCorrect) {
        const question = this.quizData.quiz[a.questionIndex]
        return sum + (question.weight || 1)
      }
      return sum
    }, 0)
  },
  
  get maxScore() {
    if (!this.quizData?.quiz) return 0
    return this.quizData.quiz.reduce((sum, q) => sum + (q.weight || 1), 0)
  },
  
  // Save quiz to localStorage
  saveToHistory() {
    if (!this.quizData || !this.quizCode) return
    
    const pastQuizzes = this.getPastQuizzes()
    const existing = pastQuizzes.find(q => q.hash === this.quizHash)
    
    if (!existing) {
      pastQuizzes.unshift({
        hash: this.quizHash,
        title: this.quizData.title,
        code: this.quizCode,
        questionCount: this.totalQuestions,
        savedAt: Date.now()
      })
      // Keep only last 10 quizzes
      if (pastQuizzes.length > 10) {
        pastQuizzes.pop()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pastQuizzes))
    }
  },
  
  getPastQuizzes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  },
  
  removePastQuiz(hash) {
    const pastQuizzes = this.getPastQuizzes().filter(q => q.hash !== hash)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pastQuizzes))
  },
  
  reset() {
    this.quizData = null
    this.currentQuestionIndex = 0
    this.answers = []
    this.quizHash = ''
    this.quizCode = ''
  }
})
