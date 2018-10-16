const setCountWrpper = document.querySelector('.game-step1');
const setPlayerWrapper = document.querySelector('.game-step2');
const setUser = setPlayerWrapper.querySelector('.user');
const setCase = setPlayerWrapper.querySelector('.case');
let setCountEl = setCountWrpper.querySelector('span');
let setCount = 2;
const startBtn = document.querySelector('.btn-start');
const nextStepBtn = document.querySelector('.btn-next-step');
const resultBtn = document.querySelector('.btn-view-result');
const canvasEl = document.querySelector('#canvas');
const context = canvasEl.getContext('2d');
const ladderCanvasEl = document.querySelector('#ladderCanvas');
const ladderContext = ladderCanvasEl.getContext('2d');
let canvasElWidth = canvasEl.offsetWidth;
let canvasElHeight = canvasEl.offsetHeight;
let users = null;
let cases = null;
let textForms = null;
const gap = 100;
let isDrawing = false;
let startPoint = null;
let prevUserTarget = null;
let prevCaseTarget = null;
const result = [];
const resultKeys = [];
const gameResult = [];
let drawIntervalY = null;
let drawIntervalX = null;

setCountWrpper.addEventListener('click', (ev) => {
  if (ev.target.classList.contains('minus')) {
    if (setCountEl.textContent > 2) {
      setCountEl.textContent = Number(setCountEl.textContent) - 1;
      setCount = Number(setCountEl.textContent);
    } else {
      alert('최소 2명 이상');
    }
  } else if (ev.target.classList.contains('plus')) {
    if (setCountEl.textContent < 10) {
      setCountEl.textContent = Number(setCountEl.textContent) + 1;
      setCount = Number(setCountEl.textContent);
    } else {
      alert('최대 10명 이하');
    }
  }
});

startBtn.addEventListener('click', (ev) => {
  setCountWrpper.style.display = 'none';
  startPoint = (canvasElWidth - ((setCount - 1) * gap)) / 2;

  for (let i = 0; i < setCount; i++) {
    const userInput = document.createElement('input');
    userInput.setAttribute('type', 'text');
    userInput.classList.add('text');
    setUser.appendChild(userInput);

    const caseInput = document.createElement('input');
    caseInput.setAttribute('type', 'text');
    caseInput.classList.add('text');
    setCase.appendChild(caseInput);

    // canvas 세로선 그리기
    context.beginPath();
    context.moveTo(startPoint + gap * i, 0);
    context.lineTo(startPoint + gap * i, canvasElHeight);
    context.lineWidth = 2;
    context.strokeStyle = '#999999';
    context.stroke();
  }

  users = document.querySelector('.user').querySelectorAll('.text');
  cases = document.querySelector('.case').querySelectorAll('.text');
});

nextStepBtn.addEventListener('click', (ev) => {
  textForms = document.querySelectorAll('.text');

  let hasTextFormsValue = false;
  for (let i = 0; i < textForms.length; i++) {
    if (!textForms[i].value) {
      alert('빈칸입력');
      i = textForms.length;
    } else if (i === textForms.length - 1) {
      hasTextFormsValue = true;
      textForms.forEach((formEl) => {
        formEl.setAttribute('readonly','true');
        nextStepBtn.style.display = 'none';
        resultBtn.style.display = 'inline-block';
      });
    }
  }

  if ( hasTextFormsValue ) {
    let setHorizontalLineNumber = (setCount + setCount) + parseInt(Math.random() * (setCount * 5));
    let setHorizontalLineStorage = [];
    let sectionLineStorage = [];

    for (let i = 0; i < setHorizontalLineNumber; i++) {
      function makeRandomTopValue() {
        let setTopValue = parseInt(Math.random() * (canvasElHeight - 40) + 20);

        function validateLineGap (value) {
          let result = true;

          for (let i = -5; i <= 5; i++) {
            if (setHorizontalLineStorage.indexOf(value + i) !== -1) {
              result = false;
              return result;
            }
          }

          return result;
        }

        if (validateLineGap(setTopValue)) {
          setHorizontalLineStorage.push(setTopValue);
        } else {
          makeRandomTopValue();
        }
      }
      makeRandomTopValue();
    }
    setHorizontalLineStorage.sort((a,b) => a - b);

    for (let i = 0; i < setCount - 1; i++) { // section의 개수만큼 순회하기
      sectionLineStorage[i] = []; // sectionLineStorage[0]번째 빈배열만들기
      let sectionLineAmount = null; // section별 가로라인의 개수

      if (setHorizontalLineNumber % (setCount - 1) !== 0) { // 홀수일때
        if (i === 0) {// 처음에만 한개 더 넣기
          sectionLineAmount = parseInt(setHorizontalLineNumber / (setCount - 1)) + 1;
        } else {// 처음을 제외한 다음번부터 전체 가로라인 / section
          sectionLineAmount = parseInt(setHorizontalLineNumber / (setCount - 1));
        }
      } else {
        sectionLineAmount = setHorizontalLineNumber / (setCount - 1);
      }

      for (let j = 0; j < sectionLineAmount; j++) {
        let randomIndex = parseInt(Math.random() * setHorizontalLineStorage.length - 1);
        sectionLineStorage[i].push(setHorizontalLineStorage[randomIndex]);
        setHorizontalLineStorage.splice(randomIndex, 1);
      }
    }

    for (let i = 0; i < setCount; i++) {
      let sectionLineInfo = {}
      if (i === 0) {
        for (let j = 0; j < sectionLineStorage[i].length; j++) {
          let key = sectionLineStorage[i][j];
          sectionLineInfo[key] = +1;
        }
      } else if (i > 0 && i < setCount - 1) {
        for (let j = 0; j < sectionLineStorage[i].length; j++) {
          let key = sectionLineStorage[i][j];
          sectionLineInfo[key] = +1;
        }

        for (let k = 0; k < sectionLineStorage[i-1].length; k++) {
          let key = sectionLineStorage[i-1][k];
          sectionLineInfo[key] = -1;
        }
      } else {
        for (let j = 0; j < sectionLineStorage[i-1].length; j++) {
          let key = sectionLineStorage[i-1][j];
          sectionLineInfo[key] = -1;
        }
      }
      result.push(sectionLineInfo);
    }

    result.forEach((lineInfoObj) => {
      let lineInfoArr = [];
      for (let lineTopValue in lineInfoObj) {
        lineInfoArr.push(Number(lineTopValue));
      }
      lineInfoArr.sort((a,b) => a-b);
      resultKeys.push(lineInfoArr);
    });

    let clickTargetIndex = null;
    let colorIndex = null;

    setUser.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('text')) {
        ev.target.classList.add('on');

        if (prevUserTarget && prevCaseTarget) {
          prevUserTarget.classList.remove('on');
          prevCaseTarget.classList.remove('on');
          prevUserTarget.classList.add('complete');
          prevCaseTarget.classList.add('complete');
          prevCaseTarget.classList.add(`color${colorIndex}`);
          prevUserTarget.classList.add(`color${colorIndex}`);
        } else if (prevUserTarget && !prevCaseTarget) {
          for (let i = 0; i < prevUserTarget.parentElement.querySelectorAll('.text').length; i++) {
            if (prevUserTarget === prevUserTarget.parentElement.querySelectorAll('.text')[i]) {
              let resultIndex = gameResult[i];

              prevUserTarget.classList.remove('on');
              prevUserTarget.classList.add(`complete`);
              prevUserTarget.classList.add(`color${i}`);
              cases[resultIndex].classList.remove('on');
              cases[resultIndex].classList.add(`complete`);
              cases[resultIndex].classList.add(`color${i}`);
              i = prevUserTarget.parentElement.querySelectorAll('.text').length;
            }
          }
        }

        prevUserTarget = ev.target;
        prevCaseTarget = null;

        for (let i = 0; i < ev.target.parentElement.querySelectorAll('.text').length; i++) {
          if (ev.target.parentElement.querySelectorAll('.text')[i] === ev.target) {
            clickTargetIndex = i;
            colorIndex = i;
            i = ev.target.parentElement.querySelectorAll('.text').length;
          }
        }
      }

      clearInterval(drawIntervalY);
      clearInterval(drawIntervalX);
      ladderContext.clearRect(0, 0, 1000, 500);
      ladderContext.lineWidth = 3;
      ladderContext.strokeStyle = '#f15e5e';

      let x = startPoint + (clickTargetIndex * gap);
      let y = 0;
      let nextX = null;
      let nextY = resultKeys[clickTargetIndex][y];

      function drawY() {
        drawIntervalY = setInterval(() => {
          if (y < nextY) {
            ladderContext.beginPath();
            ladderContext.moveTo(x, y);
            y = y + 1;
            ladderContext.lineTo(x, y);
            ladderContext.stroke();

            if (y === canvasElHeight) {
              prevCaseTarget = cases[clickTargetIndex];
              cases[clickTargetIndex].classList.add('on');
            }
          } else {
            clearInterval(drawIntervalY);
            clickTargetIndex = result[clickTargetIndex][y] + clickTargetIndex;
            nextX = startPoint + (clickTargetIndex * gap);
            drawX();
          }
        }, 5);
      }

      function drawX() {
        drawIntervalX = setInterval(function() {
          if (x < nextX || x > nextX) {
            ladderContext.beginPath();
            ladderContext.moveTo(x, y);
            if (result[clickTargetIndex][y] > 0) {
              x = x - 1;
            } else {
              x = x + 1;
            }
            ladderContext.lineTo(x, y);
            ladderContext.stroke();
          } else {
            clearInterval(drawIntervalX);
            if (resultKeys[clickTargetIndex]) {
              for (let i = 0; i < resultKeys[clickTargetIndex].length; i++) {
                if (y < resultKeys[clickTargetIndex][i]) {
                  nextY = resultKeys[clickTargetIndex][i];
                  drawY();
                  i = resultKeys[clickTargetIndex].length;
                } else if (i === resultKeys[clickTargetIndex].length - 1) {
                  nextY = canvasElHeight;
                  drawY();
                }
              }
            }
          }
        }, 5);
      }
      drawY();
    });

    for (let i = 0; i < setCount; i++) {
      let currentIndex = i;
      let key = resultKeys[currentIndex][0];
      let resultValue = result[currentIndex][key];
      currentIndex = currentIndex + resultValue;

      function getGameResult(currentIndex, key) {
        for (let j = 0; j < resultKeys[currentIndex].length; j++) {
          if (key < resultKeys[currentIndex][j]) { // key값보다 더 큰수찾기
            key = resultKeys[currentIndex][j];
            resultValue = result[currentIndex][key];
            currentIndex = currentIndex + resultValue;
            j = resultKeys[currentIndex].length + 1;

            getGameResult(currentIndex, key);
          } else if (resultKeys[currentIndex][j] <= key && j === resultKeys[currentIndex].length - 1) {
            gameResult.push(currentIndex);
          }
        }
      }
      getGameResult(currentIndex, key);
    }
    console.log(gameResult);

    resultBtn.addEventListener('click', () => {
      if (!document.querySelector('.result-box')) {
        const divEl = document.createElement('div');
        divEl.classList.add('result-box');

        users.forEach((el, index) => {
          const pEl = document.createElement('p');
          const resultEl = document.createElement('span');
          resultEl.classList.add('result');

          pEl.textContent = `${el.value}`;
          resultEl.textContent = `${cases[gameResult[index]].value}`;

          pEl.appendChild(resultEl);
          pEl.classList.add(`color${index}`);
          divEl.appendChild(pEl);
        });

        setPlayerWrapper.appendChild(divEl);
      }
    });

    for (let i = 0; i < sectionLineStorage.length; i++) {
      for (let j = 0; j < sectionLineStorage[i].length; j++) {
        context.beginPath();
        context.moveTo(startPoint + (gap * i), sectionLineStorage[i][j]);
        context.lineTo(startPoint + (gap * i) + gap, sectionLineStorage[i][j]);
        context.stroke();
      }
    }
  }
});
