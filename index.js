document.addEventListener('DOMContentLoaded', () => {

    // --- 전역 변수 및 요소 ---
    let balance = 20000;
    const balanceEl = document.getElementById('player-balance');

    // --- 공통 함수 ---
    const updateBalance = (amount, resultEl, message, isWin) => {
        balance += amount;
        balanceEl.textContent = balance;
        resultEl.textContent = message;
        resultEl.className = isWin ? 'result-text win' : 'result-text lose';
        
        if (balance <= 0) {
            alert("파산했습니다! 새로고침하여 다시 시작하세요.");
            document.querySelectorAll('.play-btn').forEach(b => b.disabled = true);
        }
    };

    const validateBet = (bet, resultEl) => {
        if (bet > balance) {
            resultEl.textContent = "자산이 부족합니다.";
            resultEl.className = 'result-text lose';
            return false;
        }
        if (bet <= 0 || isNaN(bet)) {
            resultEl.textContent = "올바른 금액을 베팅하세요.";
            resultEl.className = 'result-text lose';
            return false;
        }
        return true;
    };

    // --- 창 관리 (열기, 닫기, 드래그) ---
    const launchers = document.querySelectorAll('.game-launcher');
    launchers.forEach(launcher => {
        launcher.addEventListener('click', () => {
            const windowId = launcher.dataset.windowId;
            const windowEl = document.getElementById(windowId);
            windowEl.classList.remove('hidden');
        });
    });

    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.game-window').classList.add('hidden');
        });
    });

    const makeDraggable = (windowEl) => {
        const header = windowEl.querySelector('.window-header');
        let offsetX, offsetY;

        const move = (e) => {
            windowEl.style.left = `${e.clientX - offsetX}px`;
            windowEl.style.top = `${e.clientY - offsetY}px`;
        };

        header.addEventListener('mousedown', (e) => {
            offsetX = e.clientX - windowEl.offsetLeft;
            offsetY = e.clientY - windowEl.offsetTop;
            document.addEventListener('mousemove', move);
        });

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', move);
        });
    };

    document.querySelectorAll('.game-window').forEach(makeDraggable);

    // --- 게임 로직 ---

    // 1. 슬롯 머신
    const slotsWindow = document.getElementById('slots-window');
    const slotElements = slotsWindow.querySelectorAll('.slot');
    const slotBetInput = slotsWindow.querySelector('.bet-input');
    const slotPlayBtn = slotsWindow.querySelector('.play-btn');
    const slotResultText = slotsWindow.querySelector('.result-text');
    const slotItems = ['🍒', '🍋', '🍉', '💰', '⭐'];

    slotPlayBtn.addEventListener('click', () => {
        const bet = parseInt(slotBetInput.value);
        if (!validateBet(bet, slotResultText)) return;
        
        slotPlayBtn.disabled = true;
        let spinCount = 0;
        const spinInterval = setInterval(() => {
            slotElements.forEach(slot => {
                slot.textContent = slotItems[Math.floor(Math.random() * slotItems.length)];
            });
            if (++spinCount > 20) {
                clearInterval(spinInterval);
                const results = Array.from(slotElements).map(s => s.textContent);
                if (results[0] === results[1] && results[1] === results[2]) {
                    const prize = results[0] === '💰' ? bet * 10 : bet * 3;
                    updateBalance(prize, slotResultText, `🎉 잭팟! +${prize}`, true);
                } else {
                    updateBalance(-bet, slotResultText, `아쉽네요! -${bet}`, false);
                }
                slotPlayBtn.disabled = false;
            }
        }, 50);
    });

    // 2. 하이-로우
    const hlWindow = document.getElementById('highlow-window');
    const cardDisplay = hlWindow.querySelector('.card-display');
    const hlBetInput = hlWindow.querySelector('.bet-input');
    const higherBtn = hlWindow.querySelector('.higher');
    const lowerBtn = hlWindow.querySelector('.lower');
    const hlResultText = hlWindow.querySelector('.result-text');
    
    let currentCardValue = 0;
    const cardMap = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

    const drawCard = () => {
        currentCardValue = Math.floor(Math.random() * 13) + 2; // 2 ~ 14
        cardDisplay.textContent = cardMap[currentCardValue] || currentCardValue;
    };
    
    const playHighLow = (choice) => {
        const bet = parseInt(hlBetInput.value);
        if (!validateBet(bet, hlResultText)) return;

        const newCardValue = Math.floor(Math.random() * 13) + 2;
        const result = newCardValue > currentCardValue ? 'higher' : (newCardValue < currentCardValue ? 'lower' : 'draw');

        if (result === 'draw' || choice === result) {
            updateBalance(bet, hlResultText, `승리! 새 카드: ${cardMap[newCardValue] || newCardValue}`, true);
        } else {
            updateBalance(-bet, hlResultText, `패배! 새 카드: ${cardMap[newCardValue] || newCardValue}`, false);
        }
        currentCardValue = newCardValue;
        cardDisplay.textContent = cardMap[currentCardValue] || currentCardValue;
    };

    higherBtn.addEventListener('click', () => playHighLow('higher'));
    lowerBtn.addEventListener('click', () => playHighLow('lower'));
    
    // 초기 카드 뽑기
    drawCard();
});
