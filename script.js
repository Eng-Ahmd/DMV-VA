let questions = [];
let currentQuestionIndex = 0;
let currentCategory = "SN";
let shuffledQuestions = [];
let correctAnswersCount = 0;
let incorrectAnswersCount = 0;

function fetchQuestions() {
    fetch('./questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;

        // Ask for number of questions for each category
        let snCount = questions.filter(q => q.category && q.category.code === "SN").length;
        let sfCount = questions.filter(q => q.category && q.category.code === "SF").length;
        let snChoice = parseInt(prompt(`Enter the count of questions from Signs Category out of ${snCount} questions`));
        let sfChoice = parseInt(prompt(`Enter the count of questions from SF Category out of ${sfCount} questions`));

        questions = questions.filter(q => 
            (q.category.code === "SN" && snChoice-- > 0) ||
            (q.category.code === "SF" && sfChoice-- > 0)
        );

        startQuiz();
    })
    .catch(error => {
        console.error("Error fetching questions:", error);
    });
}

function startQuiz() {
    const categoryQuestions = questions.filter(q => q.category && q.category.code === currentCategory);
    shuffledQuestions = categoryQuestions.sort(() => 0.5 - Math.random());
    loadQuestion(shuffledQuestions[currentQuestionIndex]);
}
function loadQuestion(question) {
    document.getElementById('question-text').innerText = question.question;
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

    if (selectedValue === currentQuestion.correctAnswer) {
        correctAnswersCount++;
        feedbackDiv.innerHTML = `<span style="color:green">${selectedAnswer.innerText}</span><br>${currentQuestion.feedback}`;
        selectedAnswer.style.backgroundColor = "lightgreen";
    } else {
        incorrectAnswersCount++;
        feedbackDiv.innerHTML = `<span style="color:red">${selectedAnswer.innerText}</span><br><span style="color:green">${correctAnswerText}</span><br>${currentQuestion.feedback}`;
        selectedAnswer.style.backgroundColor = "lightred";
    }

    document.getElementById('score').innerText = `Correct: ${correctAnswersCount}, Incorrect: ${incorrectAnswersCount}, Remaining: ${shuffledQuestions.length - (currentQuestionIndex + 1)}`;
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= shuffledQuestions.length) {
        currentQuestionIndex = 0;
        currentCategory = currentCategory === "SN" ? "SF" : "SN";
        startQuiz();
    } else {
        loadQuestion(shuffledQuestions[currentQuestionIndex]);
    }
    document.getElementById('feedback').innerHTML = '';
}

fetchQuestions();
