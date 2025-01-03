// Timer Logic
let timerElement = document.getElementById("timer");
let startTime = new Date().getTime();
let timerInterval;

function updateTimer() {
  let currentTime = new Date().getTime();
  let elapsedTime = Math.floor((currentTime - startTime) / 1000); // in seconds
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = elapsedTime % 60;
  timerElement.textContent = `Time: ${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;
}

function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Quiz Logic
const quizContainer = document.getElementById("quiz");
const submitButton = document.getElementById("submit");
const resultContainer = document.getElementById("result");

async function loadQuiz() {
  try {
    const response = await fetch("questions.json");
    if (!response.ok) throw new Error("Failed to load questions.json");
    const questions = await response.json();
    renderQuestions(questions);
  } catch (error) {
    console.error("Error loading quiz:", error);
  }
}

function renderQuestions(questions) {
  questions.forEach((q, index) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question");
    questionElement.dataset.answer = q.answer;

    const questionText = document.createElement("h3");
    questionText.textContent = `${index + 1}. ${q.question}`;
    questionElement.appendChild(questionText);

    const optionsList = document.createElement("ul");
    optionsList.classList.add("options");

    q.options.forEach((option, i) => {
      const optionItem = document.createElement("li");

      const optionInput = document.createElement("input");
      optionInput.type = "radio";
      optionInput.name = `question${index}`;
      optionInput.value = i;
      optionItem.appendChild(optionInput);

      const optionLabel = document.createElement("label");
      optionLabel.textContent = option;
      optionItem.appendChild(optionLabel);

      optionsList.appendChild(optionItem);
    });

    questionElement.appendChild(optionsList);
    quizContainer.appendChild(questionElement);
  });

  submitButton.style.display = "block";
}

function calculateResult() {
  stopTimer();

  let score = 0;
  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  const questions = document.querySelectorAll(".question");
  questions.forEach((q, index) => {
    const selectedOption = document.querySelector(
      `input[name="question${index}"]:checked`
    );
    const correctAnswer = parseInt(q.dataset.answer - 1);
    const options = q.querySelectorAll("input");

    options.forEach((option) => {
      option.disabled = true;
    });

    const correctOption = q.querySelector(
      `input[name="question${index}"][value="${correctAnswer}"]`
    ).nextSibling;
    const correctAnswerElement = document.createElement("div");
    correctAnswerElement.classList.add("correct-answer");
    correctAnswerElement.textContent = `Correct Answer: ${correctOption.textContent}`;
    q.appendChild(correctAnswerElement);

    if (selectedOption) {
      attemptedCount++;
      if (parseInt(selectedOption.value) === correctAnswer) {
        score++;
        correctCount++;
      } else {
        incorrectCount++;
        q.classList.add("incorrect");
      }
    }
  });

  // Calculate elapsed time
  const endTime = new Date().getTime();
  const timeTaken = Math.floor((endTime - startTime) / 1000); // Time in seconds
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  resultContainer.innerHTML = `
        <p>Total Score: ${score} out of ${questions.length}</p>
        <p>Attempted Questions: ${attemptedCount}</p>
        <p>Correct Questions: ${correctCount}</p>
        <p>Incorrect Questions: ${incorrectCount}</p>
        <p>Time Taken: ${minutes} minute and ${seconds} second</p>
      `;
}

submitButton.addEventListener("click", calculateResult);

// Load the quiz on page load
loadQuiz();
startTimer();
