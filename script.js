let questions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let currentCategory = "SN";
let shuffledQuestions = [];
let correctAnswersCount = 0;
let incorrectAnswersCount = 0;
let totalQuestions = 0;
let answerHistory = [];


function shuffleArray(array) {
    let shuffled = array.slice();  // create a copy of the original array to avoid modifying it
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];  // Swap elements
    }
    return shuffled;
}

function fetchQuestions() {
    fetch('./questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        questions.forEach((q, index) => {
        if (!q.category || !q.category.code) {
            console.error(`Issue found at index ${index}`, q);
        }
    });

        // Display available question counts
        document.getElementById('available-sn').innerText = questions.filter(q => q.category && q.category.code === "SN").length;
        document.getElementById('available-sf').innerText = questions.filter(q => q.category && q.category.code === "SF").length;

    })
    .catch(error => {
        console.error("Error fetching questions:", error);
    });
}

function startQuizWithSelection() {
    let snChoice = parseInt(document.getElementById('sn-count-input').value) || 0;
    let sfChoice = parseInt(document.getElementById('sf-count-input').value) || 0;

    // Shuffle the entire SN and SF questions first
    let snQuestionsAll = shuffleArray(questions.filter(q => q.category.code === "SN"));
    let sfQuestionsAll = shuffleArray(questions.filter(q => q.category.code === "SF"));

    // Initialize an empty selectedQuestions array
    selectedQuestions = [];

    // Add questions to the selectedQuestions array based on user input, but only if the user choice is greater than 0
    if(snChoice > 0) {
        let snQuestions = snQuestionsAll.slice(0, snChoice);
        selectedQuestions.push(...snQuestions);
    }

    if(sfChoice > 0) {
        let sfQuestions = sfQuestionsAll.slice(0, sfChoice);
        selectedQuestions.push(...sfQuestions);
    }

    // Update the currentCategory based on the user's selection
    if (snChoice === 0 && sfChoice > 0) {
        currentCategory = "SF";
    } else if (sfChoice === 0 && snChoice > 0) {
        currentCategory = "SN";
    } // if both are non-zero or both are zero, it doesn't matter, we can stick with the default

    totalQuestions = selectedQuestions.length; // Assuming you've declared totalQuestions somewhere globally

    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';

    startQuiz();
}

function startQuiz() {
    const categoryQuestions = selectedQuestions.filter(q => q.category && q.category.code === currentCategory);
    shuffledQuestions = categoryQuestions.sort(() => 0.5 - Math.random());
    loadQuestion(shuffledQuestions[currentQuestionIndex]);
}

function loadQuestion(question) {
    // Reset the color for the answers (2.1)
    document.querySelectorAll('.answer-button').forEach(button => {
        button.style.backgroundColor = '';
    });
    document.getElementById('question-text').innerText = "Q. " + question.question;
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = ''; 

    question.answers.forEach(answer => {
        if (answer.text.trim() !== "") {
            const buttonDiv = document.createElement('div');
            buttonDiv.className = 'answer-button';
            buttonDiv.innerText = answer.text;
            buttonDiv.dataset.value = answer.value; 
            buttonDiv.onclick = function() {
                document.querySelector('.selected-answer')?.classList.remove('selected-answer'); 
                buttonDiv.classList.add('selected-answer');
            };
            answersDiv.appendChild(buttonDiv);
        }
    });

    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'block';

    const imageElement = document.getElementById('question-image');
    if (question.images && question.images[0]) {
        imageElement.src = `./images/${question.images[0]}`;
        imageElement.alt = "Question Image"; 
        imageElement.style.display = 'block';
    } else {
        imageElement.style.display = 'none';
    }
}

function checkAnswer() {
    const selectedAnswer = document.querySelector('.selected-answer');
    const feedbackDiv = document.getElementById('feedback');

    if (!selectedAnswer) {
        feedbackDiv.innerHTML = 'Please select an answer!';
        return;
    }

    const selectedValue = selectedAnswer.dataset.value;
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correctAnswerText = currentQuestion.answers.find(answer => answer.value === currentQuestion.correctAnswer).text;
    const correctAnswerElement = document.querySelector(`[data-value='${currentQuestion.correctAnswer}']`); // 2.2: Find the correct answer element
    
    if (selectedValue === currentQuestion.correctAnswer) {
        correctAnswersCount++;
        feedbackDiv.innerHTML = `<span style="color:green">${selectedAnswer.innerText}</span><br>${currentQuestion.feedback}`;
        selectedAnswer.style.backgroundColor = "lightgreen";
    } else {
        incorrectAnswersCount++;
        feedbackDiv.innerHTML = `<span style="color:red">${selectedAnswer.innerText}</span><br><span style="color:green">${correctAnswerText}</span><br>${currentQuestion.feedback}`;
        selectedAnswer.style.backgroundColor = "lightcoral";
        correctAnswerElement.style.backgroundColor = "lightgreen"; // 2.3: Highlight correct answer
    }

    const remainingQuestions = totalQuestions - (correctAnswersCount + incorrectAnswersCount); // 1.3: Calculate remaining questions

    document.getElementById('score').innerText = `Correct: ${correctAnswersCount}, Incorrect: ${incorrectAnswersCount}, Remaining: ${remainingQuestions}`;
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'block';
    answerHistory.push({
    question: currentQuestion.question,
    selectedAnswer: selectedAnswer.innerText,
    correctAnswer: correctAnswerText,
    feedback: currentQuestion.feedback,
    isCorrect: selectedValue === currentQuestion.correctAnswer
});
}

function nextQuestion() {
    currentQuestionIndex++;
    
    // Check if the quiz has reached its end
    if (currentQuestionIndex >= shuffledQuestions.length) {
        showResults();
        return;
    }

    // If the current category has no more questions, switch to the other category
    if (!shuffledQuestions.some(q => q.category.code === currentCategory)) {
        currentCategory = currentCategory === "SN" ? "SF" : "SN";
    }

    loadQuestion(shuffledQuestions[currentQuestionIndex]);
    document.getElementById('feedback').innerHTML = '';
}

function showResults() {
    hideQuestionContainer();
    displayFinalScore();
    displayCorrectPercentage();
    displayWrongAnswers();
}

function hideQuestionContainer() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
}

function displayFinalScore() {
    document.getElementById('final-score').innerText = `Correct: ${correctAnswersCount}, Incorrect: ${incorrectAnswersCount}`;
}

function displayCorrectPercentage() {
    // Calculate the percentage of correct answers.
    let correctPercentage = (correctAnswersCount / totalQuestions) * 100;

    // Adjust the width of the colored bar element.
    const correctPercentageBar = document.getElementById('correct-percentage-bar');
    correctPercentageBar.style.width = `${correctPercentage}%`;
    
    // Display the percentage as text to the user.
    document.getElementById('score').innerText = `Your score: ${correctPercentage.toFixed(2)}% `;
    document.getElementById('percentage-text').innerText = `Your score: ${correctPercentage.toFixed(2)}%`;
}

function displayWrongAnswers() {
    const wrongAnswersContainer = document.getElementById('wrong-answers');
    wrongAnswersContainer.innerHTML = ''; 

    answerHistory.filter(a => !a.isCorrect).forEach(answer => {
        let listItem = document.createElement('div');
        listItem.className = 'wrong-answer-item';

        listItem.innerHTML = `
            <strong>Question:</strong> ${answer.question} <br>
            <span style="color:red" class="selected-answer">Your Answer: ${answer.selectedAnswer}</span> <br>
            <span style="color:green" class="correct-answer">Correct Answer: ${answer.correctAnswer}</span> <br>
            Feedback: ${answer.feedback} <br><hr>
        `;
        wrongAnswersContainer.appendChild(listItem);
    });
}
function restartQuiz() {
    // Reset global variables
    selectedQuestions = [];
    currentQuestionIndex = 0;
    currentCategory = "SN";
    shuffledQuestions = [];
    correctAnswersCount = 0;
    incorrectAnswersCount = 0;
    totalQuestions = 0;
    answerHistory = [];

    // Show category selection and hide results container
    document.getElementById('category-selection').style.display = 'block';
    document.getElementById('results-container').style.display = 'none';
    document.getElementById('feedback').innerHTML = '';
}

fetchQuestions();
