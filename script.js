const welcomeScreen = document.getElementById('welcome-screen');
const languageScreen = document.getElementById('language-screen');
const gameScreen = document.getElementById('game-screen');
const aboutModal = document.getElementById('about-modal');

const startButton = document.getElementById('start-button');
const langButtons = document.querySelectorAll('.lang-btn');
const homeButton = document.getElementById('home-button');
const aboutButton = document.getElementById('about-button');
const closeModalButton = document.getElementById('close-modal-button');

const scoreDisplay = document.getElementById('score');
const wordImage = document.getElementById('word-image');
const wordEmoji = document.getElementById('word-emoji');
const wordDisplay = document.getElementById('word-display');
const feedbackDisplay = document.getElementById('feedback-display');
const listenButton = document.getElementById('listen-button');
const speakButton = document.getElementById('speak-button');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const speechSynthesis = window.speechSynthesis;

let currentWord = {};
let currentWordIndex = 0;
let score = 0;
let currentLanguage = '';
let words = [];

function showScreen(screen) {
  welcomeScreen.classList.add('hidden');
  languageScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function startGame(lang) {
  currentLanguage = lang;
  words = [...vocabData[lang]].sort(() => 0.5 - Math.random());
  currentWordIndex = 0;
  score = 0;
  updateScore();
  displayNextWord();
  showScreen(gameScreen);
}

function displayNextWord() {
  if (currentWordIndex >= words.length) {
    showFinalScore();
    return;
  }
  currentWord = words[currentWordIndex];
  wordDisplay.textContent = currentWord.word;
  wordImage.src = currentWord.image;
  wordEmoji.textContent = currentWord.emoji;
  wordImage.classList.remove('hidden');
  wordEmoji.classList.add('hidden');
  feedbackDisplay.textContent = '';
}

function showFinalScore() {
  const finalMessage = `ทำได้ ${score} คะแนน`;
  wordDisplay.textContent = "เยี่ยมมาก!";
  feedbackDisplay.textContent = finalMessage;
  wordImage.classList.add('hidden');
  wordEmoji.textContent = '🎉';
  wordEmoji.classList.remove('hidden');

  // Speak the final score
  const utterance = new SpeechSynthesisUtterance(`เยี่ยมมาก! ${finalMessage}`);
  utterance.lang = 'th-TH';
  speechSynthesis.speak(utterance);

  setTimeout(() => showScreen(languageScreen), 3000);
}

function updateScore() {
  scoreDisplay.textContent = `⭐ ${score}`;
}

function handleSpeechResult(transcript) {
  const cleanedTranscript = transcript.toLowerCase().trim();
  const cleanedWord = currentWord.word.toLowerCase().trim();

  if (cleanedTranscript === cleanedWord) {
    score++;
    updateScore();
    showFeedback(true);
    setTimeout(() => {
      currentWordIndex++;
      displayNextWord();
    }, 1500);
  } else {
    showFeedback(false);
  }
}

function showFeedback(isCorrect) {
  feedbackDisplay.classList.remove('feedback-animation', 'text-green-500', 'text-red-500');
  void feedbackDisplay.offsetWidth;

  let feedbackText = '';
  if (isCorrect) {
    feedbackText = 'เก่งมาก!';
    feedbackDisplay.textContent = feedbackText;
    feedbackDisplay.classList.add('text-green-500', 'feedback-animation');
  } else {
    feedbackText = 'ลองอีกครั้งนะ';
    feedbackDisplay.textContent = feedbackText;
    feedbackDisplay.classList.add('text-red-500', 'feedback-animation');
  }

  // Speak the feedback text
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(feedbackText);
  utterance.lang = 'th-TH'; // Feedback is in Thai
  speechSynthesis.speak(utterance);
}

startButton.addEventListener('click', () => showScreen(languageScreen));

langButtons.forEach(button => {
  button.addEventListener('click', () => {
    startGame(button.dataset.lang);
  });
});

homeButton.addEventListener('click', () => showScreen(welcomeScreen));

aboutButton.addEventListener('click', () => aboutModal.classList.remove('hidden'));
closeModalButton.addEventListener('click', () => aboutModal.classList.add('hidden'));

listenButton.addEventListener('click', () => {
  if (!currentWord.word || speechSynthesis.speaking) return;
  const utterance = new SpeechSynthesisUtterance(currentWord.word);
  utterance.lang = currentLanguage;
  speechSynthesis.speak(utterance);
});

speakButton.addEventListener('click', () => {
  if (!recognition) {
    feedbackDisplay.textContent = "เบราว์เซอร์ไม่รองรับ";
    return;
  }

  try {
    recognition.lang = currentLanguage;
    recognition.start();

    feedbackDisplay.textContent = "กำลังฟัง...";
    feedbackDisplay.classList.remove('text-green-500', 'text-red-500');
  } catch (e) {
    if (e.name === 'InvalidStateError') {
      // Already started, do nothing
    } else {
      console.error('Speech recognition error:', e);
      feedbackDisplay.textContent = "เกิดข้อผิดพลาด";
    }
  }
});

if (recognition) {
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleSpeechResult(transcript);
  };

  recognition.onerror = (event) => {
    let errorMessage = "เกิดข้อผิดพลาด";
    if (event.error === 'no-speech') {
      errorMessage = "ไม่ได้ยินเสียงเลย";
    } else if (event.error === 'not-allowed') {
      errorMessage = "โปรดอนุญาตให้ใช้ไมโครโฟน";
    }
    feedbackDisplay.textContent = errorMessage;
    feedbackDisplay.classList.add('text-red-500');
  };

  recognition.onend = () => {
    if (feedbackDisplay.textContent === "กำลังฟัง...") {
      feedbackDisplay.textContent = "";
    }
  };
}
