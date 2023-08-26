let questions = [];
let currentQuestionIndex = 0;
let currentCategory = "SN";
let shuffledQuestions = [];
let score = 0; 

function fetchQuestions() {
    fetch('./questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        startQuiz();
    })
    .catch(error => {
        console.error("Error fetching questions:", error);
    });
}

function startQuiz() {
    const categoryQuestions = questions.filter(q => q.category && q.category.code === currentCategory);

    shuffledQuestions = categoryQuestions.sort(() => 0.5 - Math.random());

    if (shuffledQuestions[currentQuestionIndex]) {
        loadQuestion(shuffledQuestions[currentQuestionIndex]);
    } else {
        console.error('No questions available for this category or index out of bounds.');
    }
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
        score++;  
        feedbackDiv.innerHTML = `<span style="color:green">${selectedAnswer.innerText}</span><br>${currentQuestion.feedback}`;
    } else {
        feedbackDiv.innerHTML = `<span style="color:red">${selectedAnswer.innerText}</span><br><span style="color:green">${correctAnswerText}</span><br>${currentQuestion.feedback}`;
    }

    document.getElementById('score').innerText = "Score: " + score;
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
