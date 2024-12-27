// Variables globales
const timerElement = document.getElementById('timer');
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const startBtn = document.getElementById('start-btn');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const finalScoreValue = document.getElementById('final-score-value');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const rankingElement = document.getElementById('ranking');
const rankingList = document.getElementById('ranking-list');
const restartBtn = document.getElementById('restart-btn'); // Botón Jugar de Nuevo


let score = 0;
let timeLeft = 75;
let timer;
let answeredQuestions = [];

// Sonidos
const soundCorrect = new Audio('correct-choice.mp3');
const soundIncorrect = new Audio('sounds/incorrect.mp3');
const soundTimer = new Audio('sounds/timer.mp3');
const soundStart = new Audio('Getaway Powder - DJ Freedem.mp3');

// Base de preguntas (ejemplo)
const questions = [
    { question: "¿En qué año se realizó el primer Manos a la Obra Rosario (MO)?", options: ["2005", "2006", "2011"], correct: 2 },
    { question: "¿En qué barrio se llevó a cabo la primera edición de MO Rosario?", options: ["La Rivera", "Carmen del Sauce", "9 de Julio"], correct: 0 },
    { question: "¿Cuántos años han transcurrido desde el primer MO?", options: ["10 años", "15 años", "20 años"], correct: 1 },
    { question: "¿En qué año el equipo coordinador envió una carta al Papa Francisco?", options: ["2016", "2017", "2018"], correct: 1 },
    { question: "¿En qué mes ganó el MO Rosario el concurso 'Luz del Mundo'?", options: ["Julio", "Agosto", "Septiembre"], correct: 1 },
    { question: "¿Qué organización lanzó el premio 'Solidarity'?", options: ["Fundación Chiara Luce Badano", "Aleteia", "Caritas"], correct: 0 },
    { question: "¿En qué ciudad se presentó el video del premio Solidarity en 2023?", options: ["Roma", "Sassello", "Florencia"], correct: 1 },
    { question: "¿En qué barrio trabajó MO desde 2011 hasta 2013?", options: ["La Ribera", "9 de Julio", "Unión"], correct: 0 },
    { question: "¿Quiénes fueron los coordinadores en el barrio La Ribera en 2012?", options: ["Candela Paleari y Ezequiel Machain", "Tomás Patiño y Daiana Martínez", "Regina De Matteis y Lean Locascio"], correct: 0 },
    { question: "¿En qué barrio trabajó MO después de La Ribera?", options: ["Unión", "Carmen del Sauce", "La Costa"], correct: 1 },
    { question: "¿Dónde se trabajó después de Carmen del Sauce?", options: ["La Costa", "9 de Julio", "Camino Muerto"], correct: 1 },
    { question: "¿En qué barrio se trabajó entre 2017 y 2018 sin completar un trienio?", options: ["Espinillo", "Unión", "Batallán"], correct: 1 },
    { question: "¿Por qué se extendieron los trabajos en Camino Muerto más allá de 2021?", options: ["Falta de voluntarios", "Crisis económica", "Pandemia"], correct: 2 },
    { question: "¿En qué año se trabajó por última vez en el barrio Espinillo?", options: ["2020", "2022", "2021"], correct: 1 },
    { question: "¿Qué barrio recibió el premio Solidarity en 2023?", options: ["Granaderos", "San José", "Manos a la Obra Rosario"], correct: 2 },
    { question: "¿Cuál de estos barrios se encuentra en Villa Gobernador Gálvez?", options: ["La Ribera", "Espinillo", "Granaderos"], correct: 0 },
    { question: "¿En qué año trabajaron Leandro Cuevas y Milagros Becker en Camino Muerto?", options: ["2021", "2022", "2020"], correct: 1 },
    { question: "¿En qué barrio trabajaron José Antonio Keh y Valentina Lorenzatti en 2023?", options: ["La Usina", "San José", "2 de Abril"], correct: 1 },
    { question: "¿Cuál es la distancia entre Rosario y Cañada de Gómez, donde están los barrios San José, La Usina y 2 de Abril?", options: ["50 km", "70 km", "90 km"], correct: 1 }
];

// Iniciar el juego
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

function startGame() {
    soundStart.play(); // Sonido al iniciar el juego
    score = 0;
    timeLeft = 75;
    answeredQuestions = [];
    isPaused = false;

    startBtn.classList.add('hidden');
    restartBtn.classList.add('hidden'); // Ocultar botón Reiniciar
    timerElement.classList.remove('hidden');
    questionContainer.classList.remove('hidden');
    finalScoreElement.classList.add('hidden');
    rankingElement.classList.add('hidden');
    scoreElement.classList.remove('hidden');

    questionElement.textContent = "";
    optionsElement.innerHTML = "";
    updateScore();
    nextQuestion();
    startTimer();
}

// Reiniciar juego
function restartGame() {
    soundStart.play(); // Sonido al reiniciar el juego
    clearInterval(timer);
    timerElement.textContent = "1:15";
    scoreElement.textContent = "Puntaje: 0";
    finalScoreElement.classList.add('hidden');
    restartBtn.classList.add('hidden'); // Ocultar botón Reiniciar
    startGame();
}
// Temporizador
function startTimer() {
    timer = setInterval(() => {
        if (!isPaused) { // Solo restar tiempo si no está pausado
            timeLeft--;
            timerElement.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                soundTimer.play(); // Sonido cuando se acaba el tiempo
                endGame();
            }
        }
    }, 1000);
}

// Pausar temporizador
function pauseTimer() {
    isPaused = true;
}

// Reanudar temporizador
function resumeTimer() {
    isPaused = false;
}

// Formatear tiempo
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Actualizar puntaje
function updateScore() {
    scoreElement.textContent = `Puntaje: ${score}`;
}

// Siguiente pregunta
function nextQuestion() {
    if (timeLeft <= 0 || answeredQuestions.length >= questions.length) {
        endGame();
        return;
    }

    // Reanudar el temporizador
    resumeTimer();

    const availableQuestions = questions.filter((_, index) => !answeredQuestions.includes(index));
    if (availableQuestions.length === 0) {
        endGame();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    const questionIndex = questions.indexOf(question);

    questionElement.textContent = question.question;
    optionsElement.innerHTML = "";
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(index, question.correct, questionIndex));
        optionsElement.appendChild(button);
    });
}

// Comprobar respuesta
function checkAnswer(index, correctIndex, questionIndex) {
    const buttons = optionsElement.querySelectorAll('button');

    // Desactivar todos los botones después de la primera selección
    buttons.forEach(button => {
        button.disabled = true;
    });

    // Pausar el temporizador al responder
    pauseTimer();

    if (index === correctIndex) {
        soundCorrect.play(); // Sonido correcto
        buttons[index].classList.add('correct');
        score++;
        answeredQuestions.push(questionIndex);
    } else {
        soundIncorrect.play(); // Sonido incorrecto
        buttons[index].classList.add('incorrect');
    }

    updateScore();

    setTimeout(nextQuestion, 1000); // Esperar 1 segundo antes de mostrar la siguiente pregunta
}

// Finalizar juego
function endGame() {
    clearInterval(timer);
    timerElement.textContent = "¡Tiempo terminado!";
    questionElement.textContent = "";
    optionsElement.innerHTML = "";
    scoreElement.textContent = `Puntaje final: ${score}`;
    finalScoreValue.textContent = score;

    timerElement.classList.add('hidden');
    questionContainer.classList.add('hidden');
    finalScoreElement.classList.remove('hidden');
    restartBtn.classList.remove('hidden'); // Mostrar botón Reiniciar
}