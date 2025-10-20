// HTML 요소 가져오기
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('bet-amount');
const currentCardEl = document.getElementById('current-card');
const higherBtn = document.getElementById('higher-btn');
const lowerBtn = document.getElementById('lower-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const resultMessageEl = document.getElementById('result-message');

// 게임 상태 변수
let balance = 1000;
let currentCardValue = 0;

// 카드 값 생성 (2 ~ 14)
function generateCard() {
    // 2부터 14 (A)까지의 난수 생성
    return Math.floor(Math.random() * 13) + 2;
}

// 카드 숫자를 화면에 표시 (11:J, 12:Q, 13:K, 14:A)
function displayCard(cardValue) {
    let display = cardValue;
    if (cardValue === 11) display = 'J';
    if (cardValue === 12) display = 'Q';
    if (cardValue === 13) display = 'K';
    if (cardValue === 14) display = 'A';
    return display;
}

// 게임 시작 또는 다음 라운드 준비
function startGame() {
    currentCardValue = generateCard();
    currentCardEl.textContent = displayCard(currentCardValue);
    
    // 버튼 활성화/비활성화
    higherBtn.disabled = false;
    lowerBtn.disabled = false;
    playAgainBtn.classList.add('hidden');
    resultMessageEl.textContent = '';
    resultMessageEl.className = '';
}

// 베팅 로직 처리
function placeBet(choice) {
    const betAmount = parseInt(betAmountEl.value);

    // 유효성 검사
    if (isNaN(betAmount) || betAmount <= 0) {
        alert("유효한 베팅 금액을 입력하세요.");
        return;
    }
    if (betAmount > balance) {
        alert("잔액이 부족합니다.");
        return;
    }

    // 버튼 비활성화 (중복 클릭 방지)
    higherBtn.disabled = true;
    lowerBtn.disabled = true;

    const newCardValue = generateCard();
    
    // 승패 결정
    let result = '';
    if (newCardValue > currentCardValue) {
        result = 'higher';
    } else if (newCardValue < currentCardValue) {
        result = 'lower';
    } else {
        result = 'draw';
    }
    
    // 결과에 따라 잔액 업데이트 및 메시지 표시
    if (result === 'draw') {
        resultMessageEl.textContent = `무승부! 다음 카드는 [${displayCard(newCardValue)}] 입니다.`;
        resultMessageEl.className = 'draw';
    } else if (choice === result) {
        balance += betAmount;
        resultMessageEl.textContent = `승리! ${betAmount}원을 얻었습니다. 다음 카드는 [${displayCard(newCardValue)}] 입니다.`;
        resultMessageEl.className = 'win';
    } else {
        balance -= betAmount;
        resultMessageEl.textContent = `패배! ${betAmount}원을 잃었습니다. 다음 카드는 [${displayCard(newCardValue)}] 입니다.`;
        resultMessageEl.className = 'loss';
    }

    balanceEl.textContent = balance;
    currentCardValue = newCardValue; // 새 카드를 현재 카드로 업데이트

    // 게임 오버 확인
    if (balance <= 0) {
        resultMessageEl.textContent = "파산했습니다! 게임 오버.";
        resultMessageEl.className = 'loss';
        playAgainBtn.classList.remove('hidden');
        return;
    }
    
    // 2초 후 다음 라운드 준비
    setTimeout(() => {
        currentCardEl.textContent = displayCard(currentCardValue);
        resultMessageEl.textContent = '';
        resultMessageEl.className = '';
        higherBtn.disabled = false;
        lowerBtn.disabled = false;
    }, 2000);
}

// 새 게임 시작 로직
function resetGame() {
    balance = 1000;
    balanceEl.textContent = balance;
    startGame();
}

// 이벤트 리스너 연결
higherBtn.addEventListener('click', () => placeBet('higher'));
lowerBtn.addEventListener('click', () => placeBet('lower'));
playAgainBtn.addEventListener('click', resetGame);

// 페이지 로드 시 게임 시작
window.addEventListener('load', startGame);