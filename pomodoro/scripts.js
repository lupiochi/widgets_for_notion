let workTime = 25 * 60; // Default Work time
let shortBreakTime = 5 * 60; // Default Short break time
let longBreakTime = 15 * 60; // Default Long break time
let time = workTime; // Timer starts with work time
let timerInterval;
let onBreak = false;
let breakType = "short";
let isPaused = false;

// Start Timer
function startTimer() {
  if (timerInterval) return; // Prevent multiple intervals

  // If paused, resume from the paused time
  if (isPaused) {
    isPaused = false;
  } else {
    // Reset the time to the current session (either work, short break, or long break)
    time = onBreak ? (breakType === "short" ? shortBreakTime : longBreakTime) : workTime;
  }

  document.getElementById("start-button").classList.add("active");
  document.getElementById("pause-button").classList.remove("active");

  timerInterval = setInterval(function() {
    if (time > 0) {
      time--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert(onBreak ? "Break is over! Time to work." : "Work session is over! Take a break.");

      onBreak = !onBreak;
      time = onBreak ? (breakType === "short" ? shortBreakTime : longBreakTime) : workTime;

      startTimer(); // Auto-start next session
    }
  }, 1000);
}

// Pause Timer
function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval); // Stop the timer
    timerInterval = null; // Clear the interval
    isPaused = true; // Set paused state

    document.getElementById("pause-button").classList.add("active");
    document.getElementById("start-button").classList.remove("active");
  }
}

// Reset Timer
function resetTimer() {
  clearInterval(timerInterval); // Clear any running timer
  timerInterval = null; // Reset the interval
  isPaused = false; // Reset pause state
  onBreak = false; // Reset break state
  breakType = "short"; // Reset break type
  time = workTime; // Reset time to workTime

  updateTimerDisplay(); // Update the display to the initial state

  document.getElementById("start-button").classList.remove("active");
  document.getElementById("pause-button").classList.remove("active");
}

// Update Timer Display
function updateTimerDisplay() {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  document.getElementById("timer").innerHTML = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// Open Settings Modal
function openSettings() {
  const modal = document.getElementById("settings-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

// Close Settings Modal
function closeSettings() {
  const modal = document.getElementById("settings-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Save Settings and Apply Them
function saveSettings() {
  const customPomodoroTime = document.getElementById('pomodoroTime').value;
  const customShortBreakTime = document.getElementById('shortBreakTime').value;
  const customLongBreakTime = document.getElementById('longBreakTime').value;

  workTime = customPomodoroTime * 60;
  shortBreakTime = customShortBreakTime * 60;
  longBreakTime = customLongBreakTime * 60;

  // Reset the timer state and time after applying new settings
  time = workTime;
  isPaused = false;
  resetTimer(); // Reset the timer to new settings

  closeSettings(); // Hide settings modal
}

// Random Background Image on Load
window.onload = function() {
  const images = ['bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg5.jpg', 'bg6.jpg'];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  const container = document.querySelector('.container');
  container.style.backgroundImage = `url('images/${randomImage}')`;
  container.style.backgroundSize = 'cover';
  container.style.backgroundPosition = 'center';
};
