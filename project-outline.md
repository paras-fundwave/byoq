Project: BYOQ

Tech:
- framework: Vue + tailwindcss
- build-tool: Vite
- app-type: SPA
- design: blocky gamified with only dark mode

Pages:
- `landing`
  - Users get 2 options: Paste a quiz code or generate a new quiz
- `generate-quiz`
  - textarea to paste a json for the quiz (format below) - placeholder
  - preview window right next to the quiz input textarea - handle errors in json
  - copy option below with an option to copy it
- `start-quiz`
  - show title and description of the quiz
- `quiz-question`
  - each question should show the question clearly alongwith a caption (if present)
  - upon selecting any option the reasoning should be shown
  - when incorrect option is choosen - the option border should turn red and correct option should be highlighted
  - the page should have the following buttons
    - explain - visible once question is answered - should unfurl reasoning of all options
    - previous
    - next (disabled depending on question.skippable)
- `quiz-summary`
  - show a summary of users performance
    - percentage
    - score (based on weight)
    - hash of the quiz-code

Architecture:
- no backend - all client side and open
- Quiz would be the following json format - an array of questions
  ```
    {
      "title": "...",
      "description": "...",
      "caption": "...",
      "quiz": [{
        "question": "A backend engineer needs to implement a \"secure logout\" feature that ensures no user data (cookies, local storage, etc.) remains in the browser. Which header is the most comprehensive tool for this specific task?",
        "caption": "...",
        "skippable": <boolean>,
        "weight": <number>,
        "answerOptions": [
          {
            "text": "Cache-Control: no-store",
            "rationale": "This header instructs the browser not to store a specific response, but it does not actively clear already-existing storage or cookies from the origin.",
            "isCorrect": false
          },
          {
            "text": "Clear-Site-Data",
            "rationale": "This header is designed for this exact purpose, instructing the browser to wipe specified types of data like cookies, storage, and cache for the entire origin.",
            "isCorrect": true
          },
          {
            "text": "Set-Cookie: session=; expires=Thu, 01 Jan 1970 00:00:00 GMT",
            "rationale": "This approach only targets a specific cookie, leaving other cookies, local storage, and the browser cache intact.",
            "isCorrect": false
          },
          {
            "text": "Pragma: no-cache",
            "rationale": "This is a legacy HTTP/1.0 header for caching that has been superseded by `Cache-Control` and does not provide a mechanism for clearing all site data.",
            "isCorrect": false
          }
        ],
        "hint": "Consider the header designed to wipe more than just the session cookie or the current page's cache."
      }]
    }
  ```
- the app can receive the code in query param as well - in this case, user should be directly take to taken to the `start-quiz` page

Logic:
- the quiz-code is the json of questions - minified, compressed and encoded so it can be decoded back on the client
- once a quiz starts - we should show a unique code (hash) somewhere on the screen so that when screenshots are taken, others can verify that the json of questions wasn't altered
