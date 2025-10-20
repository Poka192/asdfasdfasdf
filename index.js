document.addEventListener('DOMContentLoaded', () => {
    // --- 공통 변수 및 요소 ---
    let playerBalance = 5000;
    const balanceEl = document.getElementById('player-balance');

    const views = document.querySelectorAll('.view');
    const gameChoices = document.querySelectorAll('.game-choice');
    const backBtns = document.querySelectorAll('.back-btn');

    // --- 화면 전환 로직 ---
    function showView(viewId) {
        views.forEach(view => {
            view.classList.add('hidden');
            view.classList.remove('active');
        });
        const activeView = document.getElementById(viewId);
        activeView.classList.remove('hidden');
        activeView.classList.add('active');
    }

    gameChoices.forEach(choice => {
        choice.addEventListener('click', () => {
            const gameId = choice.dataset.game + '-game';
            showView(gameId);
            // 각 게임 초기화
            if(choice.dataset.game === 'high-low') initHighLow();
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showView('game-lobby');
        });
    });

    // --- 공통 함수 ---
    function updateBalance(amount) {
        playerBalance += amount;
        balanceEl.textContent = playerBalance;
    }

    function validateBet(betAmount, resultEl) {
        if (isNaN(betAmount) || betAmount <= 0) {
            resultEl.textContent = "유효한 금액을 베팅하세요.";
            resultEl.className = 'result-message loss';
            return false;
        }
        if (betAmount > playerBalance) {
            resultEl.textContent = "잔액이 부족합니다.";
            resultEl.className = 'result-message loss';
            return false;
        }
        return true;
    }

    // --- 1. 하이-로우 카드 게임 로직 ---
    const hl = {
        cardEl: document.getElementById('hl-current-card'),
        betEl: document.getElementById('hl-bet-amount'),
        resultEl: document.getElementById('hl-result'),
        higherBtn: document.getElementById('hl-higher-btn'),
        lowerBtn: document.getElementById('hl-lower-btn'),
        currentCardValue: 0,
    };

    function initHighLow() {
        hl.currentCardValue = generateCard();
        hl.cardEl.textContent = displayCard(hl.currentCardValue);
        hl.resultEl.textContent = '';
    }

    function generateCard() { return Math.floor(Math.random() * 13) + 2; }
    
    function displayCard(val) {
        if (val === 11) return 'J';
        if (val === 12) return 'Q';
        if (val === 13) return 'K';
        if (val === 14) return 'A';
        return val;
    }
    
    function playHighLow(choice) {
        const bet = parseInt(hl.betEl.value);
        if (!validateBet(bet, hl.resultEl)) return;

        const newCard = generateCard();
        let result = '';
        if (newCard > hl.currentCardValue) result = 'higher';
        else if (newCard < hl.currentCardValue) result = 'lower';
        else result = 'draw';
        
        if (result === 'draw') {
            hl.resultEl.textContent = `무승부! 새 카드는 [${displayCard(newCard)}]`;
            hl.resultEl.className = 'result-message draw';
        } else if (choice === result) {
            updateBalance(bet);
            hl.resultEl.textContent = `승리! +${bet}원. 새 카드는 [${displayCard(newCard)}]`;
            hl.resultEl.className = 'result-message win';
        } else {
            updateBalance(-bet);
            hl.resultEl.textContent = `패배! -${bet}원. 새 카드는 [${displayCard(newCard)}]`;
            hl.resultEl.className = 'result-message loss';
        }

        hl.currentCardValue = newCard;
        hl.cardEl.textContent = displayCard(hl.currentCardValue);

        if (playerBalance <= 0) alert("파산했습니다! 게임 오버.");
    }

    hl.higherBtn.addEventListener('click', () => playHighLow('higher'));
    hl.lowerBtn.addEventListener('click', () => playHighLow('lower'));


    // --- 2. 동전 던지기 게임 로직 ---
    const cf = {
        coinEl: document.getElementById('coin'),
        betEl: document.getElementById('cf-bet-amount'),
        resultEl: document.getElementById('cf-result'),
        headsBtn: document.getElementById('cf-heads-btn'),
        tailsBtn: document.getElementById('cf-tails-btn'),
    };
    
    function playCoinFlip(choice) {
        const bet = parseInt(cf.betEl.value);
        if (!validateBet(bet, cf.resultEl)) return;

        cf.headsBtn.disabled = true;
        cf.tailsBtn.disabled = true;

        // 동전 돌리기 애니메이션
        let flips = 0;
        const flipInterval = setInterval(() => {
            cf.coinEl.textContent = Math.random() < 0.5 ? '앞' : '뒤';
            flips++;
            if (flips > 10) {
                clearInterval(flipInterval);
                const result = Math.random() < 0.5 ? 'heads' : 'tails';
                cf.coinEl.textContent = result === 'heads' ? '앞' : '뒤';

                if (choice === result) {
                    updateBalance(bet);
                    cf.resultEl.textContent = `승리! +${bet}원`;
                    cf.resultEl.className = 'result-message win';
                } else {
                    updateBalance(-bet);
                    cf.resultEl.textContent = `패배! -${bet}원`;
                    cf.resultEl.className = 'result-message loss';
                }

                cf.headsBtn.disabled = false;
                cf.tailsBtn.disabled = false;
                if (playerBalance <= 0) alert("파산했습니다! 게임 오버.");
            }
        }, 100);
    }
    
    cf.headsBtn.addEventListener('click', () => playCoinFlip('heads'));
    cf.tailsBtn.addEventListener('click', () => playCoinFlip('tails'));


    // --- 3. 숫자 추측 게임 로직 ---
    const gn = {
        guessEl: document.getElementById('gn-guess'),
        betEl: document.getElementById('gn-bet-amount'),
        resultEl: document.getElementById('gn-result'),
        submitBtn: document.getElementById('gn-submit-btn'),
    };

    function playGuessNumber() {
        const bet = parseInt(gn.betEl.value);
        const guess = parseInt(gn.guessEl.value);

        if (isNaN(guess) || guess < 1 || guess > 10) {
            gn.resultEl.textContent = "1에서 10 사이의 숫자를 입력하세요.";
            gn.resultEl.className = 'result-message loss';
            return;
        }
        if (!validateBet(bet, gn.resultEl)) return;
        
        const answer = Math.floor(Math.random() * 10) + 1;

        if (guess === answer) {
            const winnings = bet * 4; // 5배 보상이므로 베팅액 + 4배
            updateBalance(winnings);
            gn.resultEl.textContent = `정답! +${winnings}원 (정답: ${answer})`;
            gn.resultEl.className = 'result-message win';
        } else {
            updateBalance(-bet);
            gn.resultEl.textContent = `실패! -${bet}원 (정답: ${answer})`;
            gn.resultEl.className = 'result-message loss';
        }
        if (playerBalance <= 0) alert("파산했습니다! 게임 오버.");
    }
    
    gn.submitBtn.addEventListener('click', playGuessNumber);

    // --- 초기화 ---
    balanceEl.textContent = playerBalance;
    showView('game-lobby'); // 시작 시 로비 화면 표시
});
