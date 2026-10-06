const STORAGE_KEYS = {
  users: 'magicMongooseUsers',
  leaderboard: 'magicMongooseLeaderboard',
  currentUser: 'magicMongooseCurrentUser'
};

const questionBank = [
  { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 'Mars' },
  { question: 'What is the capital city of Japan?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo'], answer: 'Tokyo' },
  { question: 'Which animal is the largest mammal on Earth?', options: ['Elephant', 'Blue whale', 'Giraffe', 'Hippopotamus'], answer: 'Blue whale' },
  { question: 'Which gas do humans need to breathe to survive?', options: ['Carbon dioxide', 'Hydrogen', 'Oxygen', 'Helium'], answer: 'Oxygen' },
  { question: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], answer: '6' },
  { question: 'Which language is primarily spoken in Brazil?', options: ['Spanish', 'French', 'Portuguese', 'Italian'], answer: 'Portuguese' },
  { question: 'Who painted the Mona Lisa?', options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'], answer: 'Leonardo da Vinci' },
  { question: 'Which ocean is the largest on Earth?', options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], answer: 'Pacific Ocean' },
  { question: 'What is the freezing point of water in Celsius?', options: ['0°C', '10°C', '32°C', '100°C'], answer: '0°C' },
  { question: 'Which organ pumps blood around the body?', options: ['Brain', 'Liver', 'Lungs', 'Heart'], answer: 'Heart' },
  { question: 'Which country has the most natural lakes?', options: ['Canada', 'Norway', 'Sweden', 'United States'], answer: 'Canada' },
  { question: 'Which bird is famous for mimicking sounds and words?', options: ['Eagle', 'Parrot', 'Penguin', 'Owl'], answer: 'Parrot' },
  { question: 'What do bees collect from flowers to make honey?', options: ['Dirt', 'Nectar', 'Leaves', 'Pebbles'], answer: 'Nectar' },
  { question: 'Which movie features a lion named Simba?', options: ['Frozen', 'Shrek', 'The Lion King', 'Toy Story'], answer: 'The Lion King' },
  { question: 'Which planet has the famous rings?', options: ['Mars', 'Saturn', 'Neptune', 'Venus'], answer: 'Saturn' },
  { question: 'How many months are in a year?', options: ['10', '11', '12', '13'], answer: '12' },
  { question: 'Which is the tallest mammal?', options: ['Giraffe', 'Camel', 'Horse', 'Bear'], answer: 'Giraffe' },
  { question: 'Which metal is liquid at room temperature?', options: ['Silver', 'Iron', 'Mercury', 'Gold'], answer: 'Mercury' },
  { question: 'Which continent is the Sahara Desert located on?', options: ['Asia', 'North America', 'Africa', 'Australia'], answer: 'Africa' },
  { question: 'What is the hardest natural substance on Earth?', options: ['Diamond', 'Gold', 'Quartz', 'Iron'], answer: 'Diamond' }
];

const state = {
  currentUser: localStorage.getItem(STORAGE_KEYS.currentUser) || null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  correctCount: 0,
  score: 0,
  timeLimit: 45,
  timeLeft: 45,
  timerId: null,
  gameActive: false,
  questionLocked: false,
  gameStartedAt: null
};

const splashScreen = document.getElementById('splashScreen');
const mainApp = document.getElementById('mainApp');

const authTabs = document.querySelectorAll('[data-auth-tab]');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');
const logoutBtn = document.getElementById('logoutBtn');
const authPanel = document.getElementById('authPanel');
const gamePanel = document.getElementById('gamePanel');
const playerName = document.getElementById('playerName');
const timerValue = document.getElementById('timerValue');
const scoreValue = document.getElementById('scoreValue');
const questionCount = document.getElementById('questionCount');
const correctPill = document.getElementById('correctPill');
const questionText = document.getElementById('questionText');
const answerList = document.getElementById('answerList');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const resultMessage = document.getElementById('resultMessage');
const leaderboardList = document.getElementById('leaderboardList');

function hideSplashScreen() {
  setTimeout(() => {
    splashScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
  }, 3400);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadUsers() {
  const saved = localStorage.getItem(STORAGE_KEYS.users);
  return saved ? JSON.parse(saved) : {};
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function loadLeaderboard() {
  const saved = localStorage.getItem(STORAGE_KEYS.leaderboard);
  return saved ? JSON.parse(saved) : [];
}

function saveLeaderboard(entries) {
  localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(entries));
}

function setAuthMessage(message, type = '') {
  authMessage.textContent = message;
  authMessage.className = 'message';
  if (type) {
    authMessage.classList.add(type);
  }
}

function setResultMessage(message, type = '') {
  resultMessage.textContent = message;
  resultMessage.className = 'message';
  if (type) {
    resultMessage.classList.add(type);
  }
}

function switchAuthTab(tabName) {
  authTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.authTab === tabName);
  });

  authForms.forEach(form => {
    form.classList.toggle('active', form.id === `${tabName}Form`);
  });
}

function showLoggedInState() {
  const user = state.currentUser;

  if (!user) {
    authPanel.classList.remove('hidden');
    gamePanel.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    return;
  }

  authPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  playerName.textContent = user;

  renderLeaderboard();
}

function registerUser(event) {
  event.preventDefault();

  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirm').value;

  if (!username || !password || !confirmPassword) {
    setAuthMessage('Please fill in every field.', 'error');
    return;
  }

  if (username.length < 3) {
    setAuthMessage('Username must be at least 3 characters long.', 'error');
    return;
  }

  if (password.length < 4) {
    setAuthMessage('Password must be at least 4 characters long.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    setAuthMessage('Passwords do not match.', 'error');
    return;
  }

  const users = loadUsers();

  if (users[username]) {
    setAuthMessage('That username is already taken.', 'error');
    return;
  }

  users[username] = password;
  saveUsers(users);

  signupForm.reset();
  setAuthMessage('Account created! You can log in now.', 'success');
  switchAuthTab('login');
}

function logInUser(event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    setAuthMessage('Please enter a username and password.', 'error');
    return;
  }

  const users = loadUsers();

  if (!users[username]) {
    setAuthMessage('User not found. Please sign up first.', 'error');
    return;
  }

  if (users[username] !== password) {
    setAuthMessage('Incorrect password.', 'error');
    return;
  }

  state.currentUser = username;
  localStorage.setItem(STORAGE_KEYS.currentUser, username);
  loginForm.reset();
  setAuthMessage('', '');
  showLoggedInState();
}

function logOutUser() {
  state.currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  state.currentQuestions = [];
  clearInterval(state.timerId);
  state.timerId = null;
  state.gameActive = false;
  state.questionLocked = false;
  questionText.textContent = 'Ready to play?';
  answerList.innerHTML = '';
  resultMessage.textContent = '';
  startBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');
  timerValue.textContent = `${state.timeLimit}s`;
  scoreValue.textContent = '0';
  questionCount.textContent = 'Question 1 of 5';
  correctPill.textContent = 'Correct: 0';
  showLoggedInState();
}

function getRandomQuestions() {
  return shuffleArray(questionBank).slice(0, 5);
}

function startQuiz() {
  if (!state.currentUser) {
    setResultMessage('Please log in to play.', 'error');
    return;
  }

  state.currentQuestions = getRandomQuestions();
  state.currentQuestionIndex = 0;
  state.correctCount = 0;
  state.score = 0;
  state.timeLeft = state.timeLimit;
  state.gameActive = true;
  state.questionLocked = false;
  state.gameStartedAt = Date.now();
  nextBtn.classList.add('hidden');
  startBtn.textContent = 'Restart quiz';
  setResultMessage('');
  renderQuestion();
  renderTimer();
  scoreValue.textContent = '0';
  correctPill.textContent = 'Correct: 0';

  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    if (!state.gameActive) return;

    state.timeLeft -= 1;
    renderTimer();

    if (state.timeLeft <= 0) {
      finishQuiz();
    }
  }, 1000);
}

function renderTimer() {
  timerValue.textContent = `${state.timeLeft}s`;
}

function renderQuestion() {
  const question = state.currentQuestions[state.currentQuestionIndex];
  questionCount.textContent = `Question ${state.currentQuestionIndex + 1} of ${state.currentQuestions.length}`;
  correctPill.textContent = `Correct: ${state.correctCount}`;
  questionText.textContent = question.question;
  answerList.innerHTML = '';

  question.options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    button.textContent = option;
    button.addEventListener('click', () => handleAnswer(option));
    answerList.appendChild(button);
  });
}

function handleAnswer(selectedAnswer) {
  if (state.questionLocked || !state.gameActive) {
    return;
  }

  const question = state.currentQuestions[state.currentQuestionIndex];
  const buttons = [...answerList.children];
  buttons.forEach(button => {
    const isCorrect = button.textContent === question.answer;
    const isSelected = button.textContent === selectedAnswer;

    button.disabled = true;
    if (isCorrect) {
      button.classList.add('correct');
    }
    if (isSelected && !isCorrect) {
      button.classList.add('wrong');
    }
  });

  if (selectedAnswer === question.answer) {
    state.correctCount += 1;
    state.score += 100;
    setResultMessage('Nice! That answer was correct.', 'success');
  } else {
    setResultMessage(`Not quite. The correct answer was: ${question.answer}`, 'error');
  }

  scoreValue.textContent = String(state.score);
  correctPill.textContent = `Correct: ${state.correctCount}`;
  state.questionLocked = true;

  if (state.currentQuestionIndex < state.currentQuestions.length - 1) {
    nextBtn.classList.remove('hidden');
  } else {
    nextBtn.textContent = 'Finish quiz';
    nextBtn.classList.remove('hidden');
  }
}

function advanceQuestion() {
  if (!state.gameActive) return;

  state.questionLocked = false;
  nextBtn.classList.add('hidden');
  setResultMessage('');

  if (state.currentQuestionIndex < state.currentQuestions.length - 1) {
    state.currentQuestionIndex += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  if (!state.gameActive) return;

  clearInterval(state.timerId);
  state.timerId = null;
  state.gameActive = false;
  nextBtn.classList.add('hidden');

  const elapsedSeconds = Math.max(1, state.timeLimit - state.timeLeft + 1);
  const finalScore = Math.max(0, state.correctCount * 100 - elapsedSeconds);
  state.score = finalScore;
  scoreValue.textContent = String(finalScore);

  const entry = {
    username: state.currentUser,
    correct: state.correctCount,
    timeTaken: elapsedSeconds,
    score: finalScore
  };

  const leaderboard = loadLeaderboard();
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken || b.correct - a.correct);
  const topTen = leaderboard.slice(0, 10);
  saveLeaderboard(topTen);
  renderLeaderboard();

  const message = `Quiz complete! You got ${state.correctCount} correct in ${elapsedSeconds} seconds.`;
  setResultMessage(message, 'success');
}

function renderLeaderboard() {
  const leaderboard = loadLeaderboard();
  leaderboardList.innerHTML = '';

  if (!leaderboard.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-board';
    empty.textContent = 'No scores yet. Be the first champion!';
    leaderboardList.appendChild(empty);
    return;
  }

  leaderboard.forEach((entry, index) => {
    const item = document.createElement('li');
    item.className = 'leaderboard-entry';
    item.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="user-tag">${entry.username}</span>
      <span class="score-tag">${entry.score} pts</span>
    `;
    item.title = `${entry.correct} correct • ${entry.timeTaken}s`;
    leaderboardList.appendChild(item);
  });
}

authTabs.forEach(tab => {
  tab.addEventListener('click', () => switchAuthTab(tab.dataset.authTab));
});

loginForm.addEventListener('submit', logInUser);
signupForm.addEventListener('submit', registerUser);
logoutBtn.addEventListener('click', logOutUser);
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', advanceQuestion);

hideSplashScreen();
showLoggedInState();
renderLeaderboard();

if (!state.currentUser) {
  timerValue.textContent = `${state.timeLimit}s`;
  scoreValue.textContent = '0';
}
