import { nonograms } from "./nonograms.js";

let theme = 'light';
document.body.classList.add('body');
const scores =  JSON.parse(localStorage.getItem('scores')) || [];
let nanogramsFieldSize = 'easy';
let activeNanogram = 0;
let nanogramsNumberSize;
let currentNanogram;
let randomGame = activeNanogram;
let time = 0;
let timer;
let isGameStarted = false;
let isReset = false;

const clickSound = new Audio();
clickSound.src = './click.wav';
const crossSound = new Audio();
crossSound.src = './cross.wav';
const winSound = new Audio();
winSound.src = './win.wav';

newGame();

function newGame() {
  const content = `<div class="wrapper">
  <header class="header">
    <p class="subtitle">Online puzzle game</p>
    <h1 class="title">Nonograms</h1>
  </header>

  <main class="main">
  <div class="themes__wrapper">
    <button class="light-theme theme" data-theme="light">Light</button>
    <button class="dark-theme theme" data-theme="dark">Dark</button>
  </div>

    <div class="nonograms-menu">
    <button class="scores-button">High scores</button>
      <div class="level-buttons">
        <button class="level-button level-button-active" data-level="easy">5x5</button>
        <button class="level-button" data-level="middle">10x10</button>
        <button class="level-button" data-level="difficult">15x15</button>
      </div>
      <ol class="nonodrams-list"></ol>
       <button class="random-game">Random game</button>
    </div>
    
    <div class="game">
      <div class="clues-left"></div>
      <div class="game-field"></div>
    </div>

    <div class="time">00:00</div>

    <div class="game-buttons">
      <button class="game-button reset">Reset game</button>
      <button class="game-button solution">Solution</button>
      <button class="game-button save-game">Save game</button>
      <button class="game-button last-game">Continue last game</button>
    </div>
    </main>
  </div>`;

  document.body.insertAdjacentHTML('afterbegin', content);
  schowNanograms(nanogramsFieldSize, activeNanogram);

  document.querySelector('.random-game').addEventListener('click', showRandomGame);
  document.querySelector('.level-buttons').addEventListener('click', changeNanogramsList);
  document.querySelector('.reset').addEventListener('click', resetGame);
  document.querySelector('.solution').addEventListener('click', showSolution);
  document.querySelector('.save-game').addEventListener('click', saveGame);
}

function setTimer(time) {
  timer = setTimeout( ()=> {
    time++;
    document.querySelector('.time').textContent = convertTime(time);
    setTimer(time);
  }, 1000);
}

function stopTimer() {
  time = 0;
  clearTimeout(timer);
  isGameStarted = false;
  document.querySelector('.time').textContent = convertTime(time);
}

function convertTime(s) {
  return s < 60 ? `00:${String(s).padStart(2, '0')}` : `${String(parseInt(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function schowNanograms(size, active) {
  schowNanogramsList(size, active);
  schowNanogramsTable(size, active);
}

function schowNanogramsList(size, active) {
  createNanogramsList(size, active);
}

function createNanogramsList(size, active) {
  const wrapper = document.querySelector('.nonodrams-list');
  wrapper.removeEventListener('click', chooseNewNanogram);

  nonograms[size].forEach((item, index) => {
    const nanogram = document.createElement('li');
    nanogram.classList.add('nonogram-item');
    if(theme === 'dark') nanogram.classList.add('nonogram-item-dark');
    nanogram.setAttribute('data-num', index)
    if(active === index) {
      nanogram.classList.add('nonogram-item-active');
      if(theme === 'dark') nanogram.classList.add('nonogram-item-active-dark');
    };
    nanogram.textContent = item.name;

    wrapper.append(nanogram);
  });

  wrapper.addEventListener('click', chooseNewNanogram);
}

function chooseNewNanogram(event) {
  if(event.target.classList.contains('nonogram-item')) {
    if(event.target.classList.contains('nonogram-item-active')) return;

    document.querySelector('.nonogram-item-active').classList.remove('nonogram-item-active');
    if(theme === 'dark') document.querySelector('.nonogram-item-active-dark').classList.remove('nonogram-item-active-dark');
    event.target.classList.add('nonogram-item-active');
    if(theme === 'dark') event.target.classList.add('nonogram-item-active-dark');

    activeNanogram = +event.target.dataset.num;
    
    schowNanogramsTable(nanogramsFieldSize, activeNanogram);
  }
}

function changeNanogramsList(event) {
  if(event.target.classList.contains('level-button')) {
    if(event.target.dataset.level === nanogramsFieldSize) return;

    document.querySelector(`[data-level=${nanogramsFieldSize}]`).classList.remove('level-button-active');
    if(theme === 'dark') document.querySelector(`[data-level=${nanogramsFieldSize}]`).classList.remove('level-button-active-dark');
    nanogramsFieldSize = event.target.dataset.level;
    event.target.classList.add('level-button-active');
    if(theme === 'dark') event.target.classList.add('level-button-active-dark');
    

    document.querySelector('.nonodrams-list').textContent = '';
    activeNanogram = 0;
    createNanogramsList(nanogramsFieldSize, activeNanogram);
    schowNanogramsTable(nanogramsFieldSize, activeNanogram);
  }
}

function schowNanogramsTable(size, active) {
  if(size === 'easy') nanogramsNumberSize = 5;
  if(size === 'middle') nanogramsNumberSize = 10;
  if(size === 'difficult') nanogramsNumberSize = 15;

  showNewTable(nanogramsNumberSize, size, active);
  schowClues(nanogramsNumberSize, size, active);
  
  createCurrentNanogram();
}

function showNewTable(numberSize, size, active) {
  const field = document.querySelector('.game-field');
  field.removeEventListener('click', toggleItem);
  field.removeEventListener('contextmenu', markItem);
  field.textContent = '';

  createTable(numberSize, size, active);

  if(isGameStarted) {
    stopTimer();
  }
}

function createTable(numberSize, size, active) {
  const field = document.querySelector('.game-field');

  for (let index = 0; index < nonograms[size][active].img.length; index++) {
    const fieldRow = document.createElement('div');
    fieldRow.classList.add('game-field__row');
    
    for(let r = 0; r < nonograms[size][active].img[index].length; r++) {
      const item = document.createElement('div');
      item.classList.add('game-field__item');
      if(theme === 'dark') item.classList.add('game-field__item-dark');
      item.classList.add(`game-field__item-${size}`);
      if(size === 'difficult') document.querySelector('.game').classList.add('game-difficult');
      if(size !== 'difficult') document.querySelector('.game').classList.remove('game-difficult');
      item.setAttribute('data-position', r);
      item.setAttribute('data-line', index);
      if(r === 0 && index === numberSize - 1) item.classList.add('clue-after');
      if(theme === 'dark') item.classList.add('clue-after-dark');
      fieldRow.append(item);
    }
    
    field.append(fieldRow);
  }

  field.addEventListener('click', toggleItem);
  field.addEventListener('contextmenu', markItem);
}

function showRandomGame() {
  let level = createRandomNumber(0, 3);
    if(level === 0) level = 'easy';
    if(level === 1) level = 'middle';
    if(level === 2) level = 'difficult';

    let game = createRandomNumber(0, nonograms[level].length);

    while(randomGame === game) {
      game = createRandomNumber(0, nonograms[level].length);
    }
    randomGame = game;

  nanogramsFieldSize = level;
  activeNanogram = game;

  document.querySelector(`.level-button-active`).classList.remove('level-button-active');
  if(theme === 'dark') document.querySelector(`.level-button-active-dark`).classList.remove('level-button-active-dark');
  document.querySelector(`[data-level=${level}]`).classList.add('level-button-active');
  if(theme === 'dark') document.querySelector(`[data-level=${level}]`).classList.add('level-button-active-dark');
  document.querySelector('.nonodrams-list').textContent = '';
  schowNanograms(nanogramsFieldSize, activeNanogram);
}

function createRandomNumber(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function toggleItem(event) {
  


  if(event.target.classList.contains('game-field__item')) {
    if(!isGameStarted) {
      setTimer(time);
      isGameStarted = true;
    }
    
    event.target.classList.toggle('game-field__item-checked');
    if(theme === 'dark') event.target.classList.toggle('game-field__item-checked-dark');

    if(event.target.classList.contains('game-field__item-checked')) {
      currentNanogram[+event.target.dataset.line][+event.target.dataset.position] = 1;
    } else {
      currentNanogram[+event.target.dataset.line][+event.target.dataset.position] = 0;
    }
    checkIfNanogramDone();
    clickSound.play();
  }

  if(event.target.classList.contains('cross')) {
    event.target.closest('.game-field__item').classList.add('game-field__item-checked');
    if(theme === 'dark') event.target.closest('.game-field__item').classList.add('game-field__item-checked-dark');
    currentNanogram[+event.target.closest('.game-field__item').dataset.line][+event.target.closest('.game-field__item').dataset.position] = 1;
    event.target.closest('.game-field__item').innerHTML = '';
    checkIfNanogramDone();
  }

  if(isReset) {
    document.querySelector('.save-game').addEventListener('click', saveGame);
    document.querySelector('.save-game').removeEventListener('click', saveNote);
  }

  isReset = false;
}

function checkIfNanogramDone() {
  let isGameCompleted = true;

  check: for (let index = 0; index < currentNanogram.length; index++) {
    for (let l = 0; l < currentNanogram[index].length; l++) {
      if(currentNanogram[index][l] !== nonograms[nanogramsFieldSize][activeNanogram].img[index][l]) {
        isGameCompleted = false;
        break check;
      }
    }
  }

  if(isGameCompleted) {
    setTimeout(showGameOverWindow, 100);
  }
}

function showGameOverWindow() {
  const timeArray = document.querySelector('.time').textContent.split(':');
  const sec = timeArray[0] * 60 + Number(timeArray[1]);

  const message = `Great! You have solved the nonogram in ${sec} seconds!`
  const content = `<div class="${theme === 'dark' ? 'modal modal-dark' : 'modal'}">
  <div class="${theme === 'dark' ? 'modal__window modal__window-dark' : 'modal__window'}">
    <p class="modal__text">${message}</p>
    <button class="${theme === 'dark' ? 'modal__button modal__button-dark' : 'modal__button'}">Ok</button>
  </div>
  </div>`;

  time = 0;
  clearTimeout(timer);
  isGameStarted = false;

  winSound.play();

  document.body.insertAdjacentHTML('afterbegin', content);
  document.querySelector('.modal__button').addEventListener('click', closeModalWindow);

  scores.push({sec: sec, level: nanogramsFieldSize, nanogram: nonograms[nanogramsFieldSize][activeNanogram].name, time: document.querySelector('.time').textContent});

  if(scores.length > 5) {
    scores.shift();
  };

  localStorage.setItem('scores', JSON.stringify(scores));
}

function closeModalWindow() {
  document.querySelector('.modal__button').removeEventListener('click', closeModalWindow);
  document.querySelector('.modal').remove();
  document.querySelector('.game-field').removeEventListener('click', toggleItem);
  document.querySelector('.game-field').removeEventListener('contextmenu', markItem);

  document.querySelector('.time').textContent = convertTime(time);
}

function schowClues(numberSize, size, active) {
  const leftClues = [];
  const topClues = [];
  for (let index = 0; index < numberSize; index++) {
    const leftRow = [];
    let leftCount = 0;
    const topRow = [];
    let topCount = 0;
    for(let k = 0; k < nonograms[size][active].img[index].length; k++) {
      if(nonograms[size][active].img[index][k] === 0) {
        if(leftCount !== 0) leftRow.push(leftCount);
        leftCount = 0;
      } else {
        leftCount++;
      }
      if(k === nonograms[size][active].img[index].length - 1 && leftCount !== 0) leftRow.push(leftCount);
    }

    for(let k = 0; k < nonograms[size][active].img.length; k++) {
      if(nonograms[size][active].img[k][index] === 0) {
        if(topCount !== 0) topRow.push(topCount);
        topCount = 0;
      } else {
        topCount++
      }
      if(k === nonograms[size][active].img.length - 1 && topCount !== 0) topRow.push(topCount);
    }


    leftClues.push(leftRow);
    topClues.push(topRow);
  }

  const cluesLeftWrapper = document.querySelector('.clues-left');

  cluesLeftWrapper.textContent = '';

  leftClues.forEach(item => {
    const clueLine = document.createElement('div');
    clueLine.classList.add('clue-left');
    if(theme === 'dark') clueLine.classList.add('clue-left-dark');
    clueLine.classList.add(`clue-left-${size}`);
      item.forEach(i => {
        const clue = document.createElement('span');
        clue.textContent = i;
  
        clueLine.append(clue);
      })
  
    cluesLeftWrapper.append(clueLine);
  })

  const field = document.querySelector('.game-field');

  const cluesTopWrapper = document.createElement('div');
  cluesTopWrapper.classList.add('clues-top');
  if(theme === 'dark') cluesTopWrapper.classList.add('clues-top-dark');
  field.prepend(cluesTopWrapper);
  
  topClues.forEach(item => {
    const clueLine = document.createElement('div');
    clueLine.classList.add('clue-top');
    if(theme === 'dark') clueLine.classList.add('clue-top-dark');
    clueLine.classList.add(`clue-top-${size}`);

    item.forEach(i => {
      const clue = document.createElement('span');
      clue.textContent = i;

      clueLine.append(clue);
    })

    cluesTopWrapper.append(clueLine);
  })
}

function createCurrentNanogram() {
  if(nanogramsFieldSize === 'easy') nanogramsNumberSize = 5;
  if(nanogramsFieldSize === 'middle') nanogramsNumberSize = 10;
  if(nanogramsFieldSize === 'difficult') nanogramsNumberSize = 15;

  currentNanogram = Array.from({ length: nanogramsNumberSize }, (v) => v = Array.from({ length: nanogramsNumberSize }, (v) => v = 0));
}

function resetGame() {
  currentNanogram = Array.from({ length: nanogramsNumberSize }, (v) => v = Array.from({ length: nanogramsNumberSize }, (v) => v = 0));
  
  document.querySelectorAll('.game-field__item').forEach(item => {
    item.classList.remove('game-field__item-checked');
    if(theme === 'dark') item.classList.remove('game-field__item-checked-dark');
    item.innerHTML = '';
  });

  document.querySelector('.game-field').removeEventListener('click', toggleItem);
  document.querySelector('.game-field').addEventListener('click', toggleItem);

  document.querySelector('.game-field').removeEventListener('contextmenu', markItem);
  document.querySelector('.game-field').addEventListener('contextmenu', markItem);

  stopTimer();

  isReset = true;
  document.querySelector('.save-game').removeEventListener('click', saveGame);
  document.querySelector('.save-game').addEventListener('click', saveNote);
}

function showSolution() {

  currentNanogram = [...nonograms[nanogramsFieldSize][activeNanogram].img];

  const items = document.querySelectorAll('.game-field__item');
  items.forEach(item => {
    if(currentNanogram[+item.getAttribute('data-line')][+item.getAttribute('data-position')]) {
      item.classList.add('game-field__item-checked');
      if(theme === 'dark') item.classList.add('game-field__item-checked-dark');
    } else {
      item.classList.remove('game-field__item-checked');
      if(theme === 'dark') item.classList.remove('game-field__item-checked-dark');
    }
    item.innerHTML = '';
  })

  document.querySelector('.game-field').removeEventListener('click', toggleItem);
  document.querySelector('.game-field').removeEventListener('contextmenu', markItem);

  stopTimer();

  document.querySelector('.save-game').removeEventListener('click', saveGame);
  document.querySelector('.save-game').addEventListener('click', saveNote);
  isReset = true;
}

function markItem(event) {
  event.preventDefault();

  crossSound.play();

  if(event.target.classList.contains('game-field__item')) {
    event.target.classList.remove('game-field__item-checked');
    if(theme === 'dark') event.target.classList.remove('game-field__item-checked-dark');
    currentNanogram[+event.target.dataset.line][+event.target.dataset.position] = 0;
    event.target.innerHTML = '<img src="./cross.svg.png" class="cross" alt="cross">';
    checkIfNanogramDone();
  }

  if(event.target.classList.contains('cross')) {
    event.target.remove();
  }
}

document.querySelector('.scores-button').addEventListener('click', showScores);

function showScores() {
  const content = `<div class="${theme === 'dark' ? 'scores__wrapper scores__wrapper-dark' : 'scores__wrapper'}">
  <div class="${theme === 'dark' ? 'scores__window scores__window-dark' : 'scores__window'}">
    <h3 class="scores__title">High scores</h3>
    ${scores.length ? `<ol class="scores__list"></ol>` : '<p>There is no scores</p>'}
    <button class="${theme === 'dark' ? 'scores__close scores__close-dark' : 'scores__close'}">Close</button>
  </div>
  </div>`;

  document.body.insertAdjacentHTML('afterbegin', content);
  document.querySelector('.scores__close').addEventListener('click', closeScores);

  if(scores.length) {
    const scoresCopy = JSON.parse(JSON.stringify(scores));
    const list = document.querySelector('.scores__list');
    scoresCopy.sort((a, b) => a.sec - b.sec).forEach((item, index) => {
      const li = document.createElement('li');
      li.classList.add('scores__item');
      if(theme === 'dark') li.classList.add('scores__item-dark');

      const level = document.createElement('span');
      level.textContent = `${index + 1}. ${item.level}`;

      const nonogramName = document.createElement('span');
      nonogramName.textContent = item.nanogram;

      const nonogramTime = document.createElement('span');
      nonogramTime.textContent = item.time;

      li.append(level, nonogramName, nonogramTime)
      list.append(li);
    })
  }
}

function closeScores() {
  document.querySelector('.scores__close').removeEventListener('click', closeScores);
  document.querySelector('.scores__wrapper').remove();
}

document.querySelector('.themes__wrapper').addEventListener('click', setTheme);

function setTheme(event) {
  if(event.target.classList.contains('theme')) {

    if(theme === event.target.dataset.theme) {
      return;
    }

    theme = event.target.dataset.theme;
    document.body.classList.toggle('body-dark');
    document.querySelectorAll('.game-field__item').forEach(item => item.classList.toggle('game-field__item-dark'));
    document.querySelectorAll('.level-button').forEach(item => item.classList.toggle('level-button-dark'));
    document.querySelectorAll('.game-button').forEach(item => item.classList.toggle('game-button-dark'));
    document.querySelector('.random-game').classList.toggle('random-game-dark');
    document.querySelectorAll('.clues-top').forEach(item => item.classList.toggle('clues-top-dark'));
    document.querySelectorAll('.clue-top').forEach(item => item.classList.toggle('clue-top-dark'));
    document.querySelectorAll('.clue-after').forEach(item => item.classList.toggle('clue-after-dark'));
    document.querySelectorAll('.clue-left').forEach(item => item.classList.toggle('clue-left-dark'));
    document.querySelectorAll('.nonogram-item').forEach(item => item.classList.toggle('nonogram-item-dark'));
    document.querySelectorAll('.game-field__item-checked').forEach(item => item.classList.toggle('game-field__item-checked-dark'));
    document.querySelector('.level-button-active').classList.toggle('level-button-active-dark');
    document.querySelector('.nonogram-item-active').classList.toggle('nonogram-item-active-dark');
  }
}

function saveGame() {
  const timeArray = document.querySelector('.time').textContent.split(':');
  const sec = timeArray[0] * 60 + Number(timeArray[1]);
  const crossesArray = [];

  document.querySelectorAll('.game-field__item').forEach(item => {
    if(item.firstChild) {
      crossesArray.push([+item.dataset.line, +item.dataset.position]);
    }
  });

  const savedGame = {
    currentNanogram,
    time: sec,
    activeLevel: nanogramsFieldSize,
    activenongram: activeNanogram,
    activeNumberLevel: nanogramsNumberSize,
    crossesArray,
  }

  localStorage.setItem('s-game', JSON.stringify(savedGame));
}

document.querySelector('.last-game').addEventListener('click', playLastGame);

function playLastGame() {
  if(!localStorage.getItem('s-game')) {
    
    const content = `<div class="${theme === 'dark' ? 'modal modal-dark' : 'modal'}">
    <div class="${theme === 'dark' ? 'modal__window modal__window-dark' : 'modal__window'}">
      <p class="modal__text">There is no any saved games</p>
      <button class="${theme === 'dark' ? 'modal__button modal__button-dark' : 'modal__button'}">Ok</button>
    </div>
    </div>`;
  
    document.body.insertAdjacentHTML('afterbegin', content);
    document.querySelector('.modal__button').addEventListener('click', closeLastGameModalWindow);

    return;
  }

  const currentData = JSON.parse(localStorage.getItem('s-game'));

  nanogramsFieldSize = currentData.activeLevel;
  activeNanogram = currentData.activenongram;
  nanogramsNumberSize = currentData.activeNumberLevel;

  document.querySelector(`.level-button-active`).classList.remove('level-button-active');
  if(theme === 'dark') document.querySelector(`.level-button-active-dark`).classList.remove('level-button-active-dark');
  document.querySelector(`[data-level=${nanogramsFieldSize}]`).classList.add('level-button-active');
  if(theme === 'dark') document.querySelector(`[data-level=${nanogramsFieldSize}]`).classList.add('level-button-active-dark');
  document.querySelector('.nonodrams-list').textContent = '';
  schowNanograms(nanogramsFieldSize, activeNanogram);

  isGameStarted = true;
  currentNanogram = currentData.currentNanogram;

  const items = document.querySelectorAll('.game-field__item');
  items.forEach(item => {
    if(currentNanogram[+item.getAttribute('data-line')][+item.getAttribute('data-position')]) {
      item.classList.add('game-field__item-checked');
      if(theme === 'dark') item.classList.add('game-field__item-checked-dark');
    } else {
      item.classList.remove('game-field__item-checked');
      if(theme === 'dark') item.classList.remove('game-field__item-checked-dark');
    }
  })

  time = currentData.time;
  clearTimeout(timer);
  document.querySelector('.time').textContent = convertTime(time);
  setTimer(time);


  if(currentData.crossesArray.length) {
    currentData.crossesArray.forEach(item => {
      document.querySelectorAll(`[data-line="${item[0]}"]`)[item[1]].innerHTML = '<img src="./cross.svg.png" class="cross" alt="cross">';
    })
  }
}

function closeLastGameModalWindow() {
  document.querySelector('.modal__button').removeEventListener('click', closeModalWindow);
  document.querySelector('.modal').remove();
}

function saveNote() {
  const content = `<div class="note">You can't save the solution of the game and save reset game</div>`;
  document.querySelector('.game-buttons').insertAdjacentHTML('afterbegin', content);
  setTimeout(() => document.querySelector('.note').remove(), 2000);
}