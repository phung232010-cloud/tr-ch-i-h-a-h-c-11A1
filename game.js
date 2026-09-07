// ========================================================
// CHEMASTER - GAME ENGINE & INTERACTIVE LOGIC
// ========================================================

class ChemMasterApp {
  constructor() {
    this.totalScore = parseInt(localStorage.getItem('chemmaster_score')) || 0;
    this.currentStreak = 0;
    this.maxStreak = parseInt(localStorage.getItem('chemmaster_max_streak')) || 0;
    this.bestQuizScore = parseFloat(localStorage.getItem('chemmaster_best_quiz_score')) || 0;

    // Game states
    this.metalsState = {
      placed: [], // array of element objects
      nextExpectedIdx: 0,
      showHints: true,
      currentScore: 0
    };

    this.memoryState = {
      cards: [],
      flippedCards: [],
      matchedPairs: 0,
      totalPairs: 8,
      moves: 0,
      timerInterval: null,
      seconds: 0,
      isLocked: false,
      currentScore: 0
    };

    this.quizState = {
      questions: [],
      currentIndex: 0,
      timer: 30,
      maxTimer: 30,
      timerInterval: null,
      correctCount: 0,
      currentScore: 0,
      pointsPerQuestion: 0,
      isAnswered: false
    };

    this.flashcardState = {
      deckType: 'acids', // 'acids' | 'metals'
      currentIndex: 0,
      isFlipped: false
    };

    this.initConfetti();
    this.initUI();
    this.initMetalsGame();
    this.initMemoryGame();
    this.initFlashcards();
    this.initChemTable();
  }

  // ========================================================
  // CONFETTI ENGINE (Canvas Pure JS)
  // ========================================================
  initConfetti() {
    this.canvas = document.getElementById('confettiCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.confettiParticles = [];
    this.isConfettiActive = false;

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  fireConfetti() {
    this.confettiParticles = [];
    const colors = ['#00f0ff', '#9d4edd', '#f72585', '#10b981', '#f59e0b', '#ffffff'];
    for (let i = 0; i < 120; i++) {
      this.confettiParticles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        life: 1
      });
    }

    if (!this.isConfettiActive) {
      this.isConfettiActive = true;
      this.animateConfetti();
    }
  }

  animateConfetti() {
    if (!this.isConfettiActive) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.life -= 0.009;

      if (p.life <= 0) {
        this.confettiParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.confettiParticles.length > 0) {
      requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.isConfettiActive = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // ========================================================
  // UI INITIALIZATION & HEADER CONTROLS
  // ========================================================
  initUI() {
    this.updateScoreUI();

    // Sound Toggles
    const soundBtn = document.getElementById('soundToggleBtn');
    soundBtn.addEventListener('click', () => {
      soundManager.soundEnabled = !soundManager.soundEnabled;
      soundBtn.classList.toggle('active', soundManager.soundEnabled);
      soundBtn.textContent = soundManager.soundEnabled ? '🔊' : '🔇';
      soundManager.playClick();
    });

    const speechBtn = document.getElementById('speechToggleBtn');
    speechBtn.addEventListener('click', () => {
      soundManager.speechEnabled = !soundManager.speechEnabled;
      speechBtn.classList.toggle('active', soundManager.speechEnabled);
      speechBtn.textContent = soundManager.speechEnabled ? '🗣️' : '🤫';
      soundManager.playClick();
    });

    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

        btn.classList.add('active');
        const targetTabId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(targetTabId);
        if (targetContent) targetContent.classList.add('active');

        // Reset điểm và trạng thái về 0 cho mỗi trò chơi khi chuyển tab
        if (targetTabId === 'tab-metals') {
          this.initMetalsGame();
        } else if (targetTabId === 'tab-memory') {
          this.initMemoryGame();
        } else if (targetTabId === 'tab-quiz') {
          this.startQuizSession();
        }
      });
    });

    // Quiz Time Limit Select
    const timeLimitSelect = document.getElementById('quizTimeLimitSelect');
    if (timeLimitSelect) {
      timeLimitSelect.addEventListener('change', (e) => {
        this.quizState.maxTimer = parseInt(e.target.value) || 30;
        this.quizState.timer = this.quizState.maxTimer;
        this.updateTimerBar();
      });
    }

    // Quiz Controls: Restart, Format, and Count Selectors
    const restartQuizBtn = document.getElementById('restartQuizBtn');
    if (restartQuizBtn) {
      restartQuizBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.startQuizSession();
      });
    }

    const quizTypeSelect = document.getElementById('quizTypeSelect');
    if (quizTypeSelect) {
      quizTypeSelect.addEventListener('change', () => {
        soundManager.playClick();
        this.startQuizSession();
      });
    }

    const quizCountSelect = document.getElementById('quizCountSelect');
    if (quizCountSelect) {
      quizCountSelect.addEventListener('change', () => {
        soundManager.playClick();
        this.startQuizSession();
      });
    }

    // Typing Submit & Enter Key
    const submitTypingBtn = document.getElementById('quizSubmitTypingBtn');
    if (submitTypingBtn) {
      submitTypingBtn.addEventListener('click', () => {
        const q = this.quizState.questions[this.quizState.currentIndex];
        if (q) this.submitTypingAnswer(q);
      });
    }

    const typingInput = document.getElementById('quizTypingInput');
    if (typingInput) {
      typingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const q = this.quizState.questions[this.quizState.currentIndex];
          if (q) this.submitTypingAnswer(q);
        }
      });
    }

    // Quick Symbol Buttons
    document.querySelectorAll('.symbol-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sym = btn.getAttribute('data-sym');
        const input = document.getElementById('quizTypingInput');
        if (input && !input.disabled) {
          const start = input.selectionStart || input.value.length;
          const end = input.selectionEnd || input.value.length;
          input.value = input.value.substring(0, start) + sym + input.value.substring(end);
          input.focus();
          const newPos = start + sym.length;
          input.setSelectionRange(newPos, newPos);
        }
      });
    });

    // Modal Close / Actions
    document.getElementById('modalPlayAgainBtn').addEventListener('click', () => {
      soundManager.playClick();
      this.hideVictoryModal();
      const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
      if (activeTab === 'tab-metals') this.initMetalsGame();
      else if (activeTab === 'tab-memory') this.initMemoryGame();
      else if (activeTab === 'tab-quiz') this.startQuizSession();
    });

    document.getElementById('modalNextModeBtn').addEventListener('click', () => {
      soundManager.playClick();
      this.hideVictoryModal();
      const tabOrder = ['tab-metals', 'tab-memory', 'tab-quiz', 'tab-lab'];
      const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
      const nextTab = tabOrder[(tabOrder.indexOf(activeTab) + 1) % tabOrder.length];
      document.querySelector(`[data-tab="${nextTab}"]`).click();
    });
  }

  addScore(points) {
    this.currentStreak++;
    if (this.currentStreak > this.maxStreak) {
      this.maxStreak = this.currentStreak;
      localStorage.setItem('chemmaster_max_streak', this.maxStreak);
    }
    const bonus = Math.floor(points * (1 + (this.currentStreak - 1) * 0.1));
    this.totalScore += bonus;
    localStorage.setItem('chemmaster_score', this.totalScore);
    this.updateScoreUI();
    return bonus;
  }

  resetStreak() {
    this.currentStreak = 0;
    this.updateScoreUI();
  }

  updateScoreUI() {
    const scoreEl = document.getElementById('scoreDisplay');
    if (scoreEl) {
      scoreEl.textContent = this.bestQuizScore;
    }
    const streakEl = document.getElementById('streakDisplay');
    if (streakEl) {
      streakEl.textContent = this.currentStreak;
    }
  }

  updateQuizScoreUI(showAnim = false) {
    const scoreEl = document.getElementById('quizCurrentScore');
    const incEl = document.getElementById('quizScoreIncrement');
    if (!scoreEl) return;

    scoreEl.textContent = this.quizState.currentScore;

    if (showAnim && incEl) {
      const pts = this.quizState.pointsPerQuestion;
      const ptsText = Number.isInteger(pts) ? pts : pts.toFixed(1);
      incEl.textContent = `+${ptsText}đ`;
      incEl.style.display = 'inline-block';
      clearTimeout(this._incTimer);
      this._incTimer = setTimeout(() => {
        if (incEl) incEl.style.display = 'none';
      }, 1300);
    }
  }

  updateMetalsScoreUI(showAnim = false) {
    const scoreEl = document.getElementById('metalsCurrentScore');
    const incEl = document.getElementById('metalsScoreIncrement');
    if (!scoreEl) return;

    scoreEl.textContent = this.metalsState.currentScore;

    if (showAnim && incEl) {
      incEl.textContent = `+5.9đ`;
      incEl.style.display = 'inline-block';
      clearTimeout(this._metalIncTimer);
      this._metalIncTimer = setTimeout(() => {
        if (incEl) incEl.style.display = 'none';
      }, 1300);
    }
  }

  updateMemoryScoreUI(showAnim = false) {
    const scoreEl = document.getElementById('memoryCurrentScore');
    const incEl = document.getElementById('memoryScoreIncrement');
    if (!scoreEl) return;

    scoreEl.textContent = this.memoryState.currentScore;

    if (showAnim && incEl) {
      const pts = (100 / this.memoryState.totalPairs);
      const ptsText = Number.isInteger(pts) ? pts : pts.toFixed(1);
      incEl.textContent = `+${ptsText}đ`;
      incEl.style.display = 'inline-block';
      clearTimeout(this._memIncTimer);
      this._memIncTimer = setTimeout(() => {
        if (incEl) incEl.style.display = 'none';
      }, 1300);
    }
  }

  showVictoryModal(title, desc, scoreEarned, timeText, accuracyText) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalDesc').textContent = desc;
    document.getElementById('modalScoreVal').textContent = '+' + scoreEarned;
    document.getElementById('modalTimeVal').textContent = timeText;
    document.getElementById('modalAccuracyVal').textContent = accuracyText;
    document.getElementById('victoryModal').classList.add('active');
    this.fireConfetti();
    soundManager.playWin();
  }

  hideVictoryModal() {
    document.getElementById('victoryModal').classList.remove('active');
  }

  // ========================================================
  // MODE 1: SẮP XẾP DÃY KIM LOẠI
  // ========================================================
  initMetalsGame() {
    this.metalsState.placed = [];
    this.metalsState.nextExpectedIdx = 0;
    this.metalsState.currentScore = 0;
    document.getElementById('metalPlacedCount').textContent = `0 / 17`;
    this.updateMetalsScoreUI(false);

    // Toggle Hints Button
    const toggleHintBtn = document.getElementById('toggleHintBtn');
    toggleHintBtn.onclick = () => {
      soundManager.playClick();
      this.metalsState.showHints = !this.metalsState.showHints;
      document.getElementById('hintStateText').textContent = this.metalsState.showHints ? 'BẬT' : 'TẮT';
      this.renderMetalSlots();
    };

    // Reset Button
    document.getElementById('resetMetalsBtn').onclick = () => {
      soundManager.playClick();
      this.initMetalsGame();
    };

    this.renderMetalSlots();
    this.renderMetalPool();
  }

  renderMetalSlots() {
    const slotsContainer = document.getElementById('metalSlotsArea');
    slotsContainer.innerHTML = '';

    CHEMISTRY_DATA.metals.forEach((m, idx) => {
      const slot = document.createElement('div');
      slot.className = 'metal-slot';
      slot.setAttribute('data-idx', idx);

      const placedMetal = this.metalsState.placed[idx];
      if (placedMetal) {
        slot.innerHTML = `
          <div class="metal-chip correct" style="width: 100%; height: 100%; margin: 0; box-shadow: none;">
            <div class="chip-symbol">${placedMetal.symbol}</div>
            <div class="chip-name">${placedMetal.enName}</div>
            <div class="chip-valence">${placedMetal.valence}</div>
          </div>
        `;
        slot.style.cursor = 'pointer';
        slot.title = 'Bấm để nghe phát âm tiếng Anh';
        slot.onclick = () => soundManager.speak(placedMetal.enName);
      } else {
        slot.innerHTML = `
          <span class="slot-number">${idx + 1}</span>
          ${this.metalsState.showHints ? `<span class="slot-phrase">${m.phrase}</span>` : ''}
        `;
        if (idx === this.metalsState.nextExpectedIdx) {
          slot.style.borderColor = 'var(--neon-cyan)';
          slot.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.3)';
        } else {
          slot.style.borderColor = 'rgba(255, 255, 255, 0.06)';
          slot.style.boxShadow = 'none';
        }
      }
      slotsContainer.appendChild(slot);
    });
  }

  renderMetalPool() {
    const poolContainer = document.getElementById('metalPoolArea');
    poolContainer.innerHTML = '';

    // Lọc các kim loại chưa được xếp và xáo trộn ngẫu nhiên
    const unplaced = CHEMISTRY_DATA.metals.filter(
      m => !this.metalsState.placed.some(p => p && p.symbol === m.symbol)
    );

    const shuffled = [...unplaced].sort(() => Math.random() - 0.5);

    shuffled.forEach(m => {
      const chip = document.createElement('div');
      chip.className = 'metal-chip';
      chip.setAttribute('data-symbol', m.symbol);
      chip.innerHTML = `
        <div class="chip-symbol">${m.symbol}</div>
        <div class="chip-name">${m.enName}</div>
        <div class="chip-valence">${m.valence}</div>
      `;

      chip.addEventListener('click', () => this.handleMetalChipClick(m, chip));
      poolContainer.appendChild(chip);
    });
  }

  handleMetalChipClick(metal, chipElement) {
    const targetExpected = CHEMISTRY_DATA.metals[this.metalsState.nextExpectedIdx];

    if (metal.symbol === targetExpected.symbol) {
      // Đúng nguyên tố kế tiếp!
      chipElement.classList.add('correct');
      soundManager.playCorrect();
      soundManager.speak(metal.enName);

      this.metalsState.placed[this.metalsState.nextExpectedIdx] = metal;
      this.metalsState.nextExpectedIdx++;
      document.getElementById('metalPlacedCount').textContent = `${this.metalsState.nextExpectedIdx} / 17`;

      // Tính điểm thang 100 chia đều cho 17 nguyên tố
      if (this.metalsState.nextExpectedIdx === 17) {
        this.metalsState.currentScore = 100;
      } else {
        const raw = (this.metalsState.nextExpectedIdx / 17) * 100;
        this.metalsState.currentScore = Math.round(raw * 10) / 10;
      }
      this.updateMetalsScoreUI(true);

      setTimeout(() => {
        this.renderMetalSlots();
        this.renderMetalPool();

        // Kiểm tra xem đã hoàn thành toàn bộ 17 kim loại chưa
        if (this.metalsState.nextExpectedIdx >= 17) {
          setTimeout(() => {
            this.showVictoryModal(
              'Thần Tốc Dãy Kim Loại!',
              'Bạn đã xếp chuẩn xác 17 kim loại theo đúng thứ tự câu thần chú "Khi Nào Bà Cần May Áo Záp Sắt Nhớ Sang Phố Hỏi Cửa Hàng Á Phi Âu"!',
              '100/100 Điểm',
              'Hoàn thành',
              '100%'
            );
          }, 300);
        }
      }, 250);
    } else {
      // Sai vị trí!
      chipElement.classList.add('wrong');
      soundManager.playWrong();
      this.resetStreak();

      setTimeout(() => {
        chipElement.classList.remove('wrong');
      }, 400);
    }
  }

  // ========================================================
  // MODE 2: LẬT THẺ TRÍ NHỚ (MEMORY MATCH)
  // ========================================================
  initMemoryGame() {
    clearInterval(this.memoryState.timerInterval);
    this.memoryState.flippedCards = [];
    this.memoryState.matchedPairs = 0;
    this.memoryState.moves = 0;
    this.memoryState.seconds = 0;
    this.memoryState.isLocked = false;
    this.memoryState.currentScore = 0;

    const topic = document.getElementById('memoryTopicSelect').value;
    const numCards = parseInt(document.getElementById('memorySizeSelect').value);
    this.memoryState.totalPairs = numCards / 2;

    document.getElementById('memoryMoves').textContent = '0';
    document.getElementById('memoryTimer').textContent = '00:00';
    this.updateMemoryScoreUI(false);

    // Start Timer on first click or now
    this.memoryState.timerInterval = setInterval(() => {
      this.memoryState.seconds++;
      const mins = String(Math.floor(this.memoryState.seconds / 60)).padStart(2, '0');
      const secs = String(this.memoryState.seconds % 60).padStart(2, '0');
      document.getElementById('memoryTimer').textContent = `${mins}:${secs}`;
    }, 1000);

    // Build Cards Deck
    let pairs = [];
    if (topic === 'acids') {
      const selectedAcids = [...CHEMISTRY_DATA.acids].sort(() => Math.random() - 0.5).slice(0, this.memoryState.totalPairs);
      selectedAcids.forEach((acid, idx) => {
        pairs.push({
          matchId: idx,
          type: 'Công thức',
          main: acid.formula,
          sub: acid.type === 'Mạnh' ? 'Acid Mạnh' : 'Acid Yếu',
          speakText: acid.name
        });
        pairs.push({
          matchId: idx,
          type: 'Tên IUPAC',
          main: acid.name,
          sub: 'English Name',
          speakText: acid.name
        });
      });
    } else if (topic === 'radicals') {
      const selectedRadicals = [...CHEMISTRY_DATA.allRadicals].sort(() => Math.random() - 0.5).slice(0, this.memoryState.totalPairs);
      selectedRadicals.forEach((rad, idx) => {
        pairs.push({
          matchId: idx,
          type: 'Gốc Acid',
          main: rad.formula,
          sub: `Hóa trị: ${rad.valence}`,
          speakText: rad.name
        });
        pairs.push({
          matchId: idx,
          type: 'Tên Gốc',
          main: rad.name,
          sub: `(${rad.parentAcid})`,
          speakText: rad.name
        });
      });
    } else { // metals
      const selectedMetals = [...CHEMISTRY_DATA.metals].sort(() => Math.random() - 0.5).slice(0, this.memoryState.totalPairs);
      selectedMetals.forEach((m, idx) => {
        pairs.push({
          matchId: idx,
          type: 'Ký hiệu',
          main: m.symbol,
          sub: `"${m.phrase}"`,
          speakText: m.enName
        });
        pairs.push({
          matchId: idx,
          type: 'Tên & Hóa trị',
          main: m.enName,
          sub: `Hóa trị ${m.valence}`,
          speakText: m.enName
        });
      });
    }

    // Shuffle cards
    this.memoryState.cards = pairs.sort(() => Math.random() - 0.5);

    // Render Grid
    const grid = document.getElementById('memoryGrid');
    grid.className = `memory-grid grid-${numCards}`;
    grid.innerHTML = '';

    this.memoryState.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card-item';
      cardEl.setAttribute('data-index', index);
      cardEl.innerHTML = `
        <div class="card-face card-back"></div>
        <div class="card-face card-front">
          <span class="card-type-tag">${card.type}</span>
          <div class="card-content">${card.main}</div>
          <div class="card-subtext">${card.sub}</div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.handleCardFlip(cardEl, card, index));
      grid.appendChild(cardEl);
    });

    // Reset button & Change Topic/Size listeners
    document.getElementById('resetMemoryBtn').onclick = () => {
      soundManager.playClick();
      this.initMemoryGame();
    };
    document.getElementById('memoryTopicSelect').onchange = () => this.initMemoryGame();
    document.getElementById('memorySizeSelect').onchange = () => this.initMemoryGame();
  }

  handleCardFlip(cardEl, card, index) {
    if (this.memoryState.isLocked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    soundManager.playClick();
    cardEl.classList.add('flipped');
    this.memoryState.flippedCards.push({ cardEl, card, index });

    if (this.memoryState.flippedCards.length === 2) {
      this.memoryState.moves++;
      document.getElementById('memoryMoves').textContent = this.memoryState.moves;

      const [first, second] = this.memoryState.flippedCards;
      if (first.card.matchId === second.card.matchId) {
        // Cặp trùng khớp!
        this.memoryState.isLocked = true;
        setTimeout(() => {
          first.cardEl.classList.add('matched');
          second.cardEl.classList.add('matched');
          soundManager.playMatch();
          soundManager.speak(first.card.speakText || second.card.speakText);

          this.memoryState.matchedPairs++;
          this.memoryState.flippedCards = [];
          this.memoryState.isLocked = false;

          // Tính điểm thang 100 chia đều theo số cặp thẻ
          if (this.memoryState.matchedPairs === this.memoryState.totalPairs) {
            this.memoryState.currentScore = 100;
          } else {
            const raw = (this.memoryState.matchedPairs / this.memoryState.totalPairs) * 100;
            this.memoryState.currentScore = Math.round(raw * 10) / 10;
          }
          this.updateMemoryScoreUI(true);

          if (this.memoryState.matchedPairs === this.memoryState.totalPairs) {
            clearInterval(this.memoryState.timerInterval);
            const mins = String(Math.floor(this.memoryState.seconds / 60)).padStart(2, '0');
            const secs = String(this.memoryState.seconds % 60).padStart(2, '0');
            const timeFormatted = `${mins}:${secs}`;
            setTimeout(() => {
              this.showVictoryModal(
                'Tuyệt Vời!',
                `Bạn đã lật trúng toàn bộ ${this.memoryState.totalPairs} cặp thẻ trong ${this.memoryState.moves} lượt lật!`,
                '100/100 Điểm',
                timeFormatted,
                `${Math.max(40, Math.round((this.memoryState.totalPairs / this.memoryState.moves) * 100))}%`
              );
            }, 400);
          }
        }, 350);
      } else {
        // Sai cặp -> lật úp lại
        this.memoryState.isLocked = true;
        soundManager.playWrong();
        this.resetStreak();
        setTimeout(() => {
          first.cardEl.classList.remove('flipped');
          second.cardEl.classList.remove('flipped');
          this.memoryState.flippedCards = [];
          this.memoryState.isLocked = false;
        }, 850);
      }
    }
  }

  // ========================================================
  // MODE 3: ĐẤU TRƯỜNG TRẮC NGHIỆM & GÕ BÀN PHÍM
  // ========================================================
  isAnswerMatching(userInput, acceptedList) {
    if (!userInput) return false;
    const cleanInput = userInput.trim().toLowerCase();

    const removeAccents = (str) => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    const normChem = (str) => {
      return str
        .replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2').replace(/₃/g, '3').replace(/₄/g, '4')
        .replace(/⁻/g, '-').replace(/⁺/g, '+').replace(/¹/g, '1').replace(/²/g, '2').replace(/³/g, '3')
        .replace(/[\s\-_^()]+/g, '')
        .toLowerCase();
    };

    const normUser = normChem(cleanInput);
    const unaccentUser = removeAccents(cleanInput);

    for (let ans of acceptedList) {
      if (!ans) continue;
      const cleanAns = ans.trim().toLowerCase();
      if (cleanInput === cleanAns) return true;
      if (unaccentUser === removeAccents(cleanAns)) return true;
      if (normUser === normChem(cleanAns)) return true;

      if (cleanAns.includes('/')) {
        const parts = cleanAns.split('/').map(p => p.trim());
        for (let part of parts) {
          if (cleanInput === part.toLowerCase() || unaccentUser === removeAccents(part.toLowerCase()) || normUser === normChem(part)) {
            return true;
          }
        }
      }

      // Roman numerals conversion
      const romanMap = { 'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', '1': 'i', '2': 'ii', '3': 'iii', '4': 'iv' };
      if (romanMap[cleanInput] && (romanMap[cleanInput] === cleanAns || cleanAns === romanMap[cleanInput])) return true;

      // Valences with comma: e.g. "II, III" vs "2, 3"
      if (cleanAns.includes(',') || cleanInput.includes(',')) {
        const simpleAns = normChem(cleanAns).replace(/,/g, '');
        const simpleUser = normChem(cleanInput).replace(/,/g, '');
        if (simpleAns === simpleUser) return true;
      }
    }
    return false;
  }

  generateQuizQuestions() {
    const formatMode = document.getElementById('quizTypeSelect') ? document.getElementById('quizTypeSelect').value : 'mixed';
    const countMode = document.getElementById('quizCountSelect') ? document.getElementById('quizCountSelect').value : '20';

    const questionPool = [];

    // Helper tạo lựa chọn sai cho trắc nghiệm
    const makeOptions = (correct, allCandidates) => {
      const wrongs = [...new Set(allCandidates.filter(c => c && c !== correct))].sort(() => Math.random() - 0.5).slice(0, 3);
      return [correct, ...wrongs].sort(() => Math.random() - 0.5);
    };

    // 1. NHÓM ACID (17 acid x 3 dạng = 51 câu)
    const allAcidNames = CHEMISTRY_DATA.acids.map(a => a.name);
    const allAcidFormulas = CHEMISTRY_DATA.acids.map(a => a.formula);

    CHEMISTRY_DATA.acids.forEach(acid => {
      // Dạng 1: Công thức -> Tên IUPAC
      questionPool.push({
        category: 'Tên IUPAC Của Acid',
        question: `Acid có công thức phân tử <span class="highlight">${acid.formula}</span> có tên tiếng Anh chuẩn là gì?`,
        promptTyping: `Gõ tên tiếng Anh chuẩn IUPAC của acid <span class="highlight">${acid.formula}</span>:`,
        speakWord: acid.name,
        options: makeOptions(acid.name, allAcidNames),
        correctAnswer: acid.name,
        acceptedTyping: [acid.name, acid.name.replace(' acid', '')],
        explanation: `Công thức <b>${acid.formula}</b> là <b>${acid.name}</b> (Phân loại: Acid <b>${acid.type}</b>).`
      });

      // Dạng 2: Tên IUPAC -> Công thức
      questionPool.push({
        category: 'Công Thức Phân Tử Acid',
        question: `Acid <span class="highlight">${acid.name}</span> có công thức phân tử là gì?`,
        promptTyping: `Gõ công thức phân tử của <span class="highlight">${acid.name}</span>:`,
        speakWord: acid.name,
        options: makeOptions(acid.formula, allAcidFormulas),
        correctAnswer: acid.formula,
        acceptedTyping: [acid.formula, acid.htmlFormula.replace(/<[^>]*>/g, '')],
        explanation: `Acid <b>${acid.name}</b> có công thức phân tử là <b>${acid.formula}</b>.`
      });

      // Dạng 3: Phân loại Mạnh / Yếu
      questionPool.push({
        category: 'Phân Loại Acid',
        question: `Theo bảng phân loại, acid <span class="highlight">${acid.formula}</span> (${acid.name}) thuộc loại nào?`,
        promptTyping: `Acid <span class="highlight">${acid.formula}</span> (${acid.name}) thuộc loại Mạnh hay Yếu? (Gõ "Mạnh" hoặc "Yếu"):`,
        speakWord: acid.name,
        options: ['Acid Mạnh', 'Acid Yếu'],
        correctAnswer: acid.type === 'Mạnh' ? 'Acid Mạnh' : 'Acid Yếu',
        acceptedTyping: [acid.type, acid.type === 'Mạnh' ? 'manh' : 'yeu', acid.type === 'Mạnh' ? 'strong' : 'weak', `acid ${acid.type.toLowerCase()}`],
        explanation: `Acid <b>${acid.formula}</b> (${acid.name}) được phân loại là <b>Acid ${acid.type}</b>.`
      });
    });

    // 2. NHÓM GỐC ACID (23 gốc x 4 dạng = 92 câu)
    const allRadNames = CHEMISTRY_DATA.allRadicals.map(r => r.name);
    const allRadFormulas = CHEMISTRY_DATA.allRadicals.map(r => r.formula);

    CHEMISTRY_DATA.allRadicals.forEach(rad => {
      // Dạng 4: Gốc acid -> Tên gốc IUPAC
      questionPool.push({
        category: 'Tên Gốc Acid (IUPAC)',
        question: `Gốc acid <span class="highlight">${rad.formula}</span> có tên tiếng Anh chuẩn là gì?`,
        promptTyping: `Gõ tên tiếng Anh chuẩn IUPAC của gốc acid <span class="highlight">${rad.formula}</span>:`,
        speakWord: rad.name,
        options: makeOptions(rad.name, allRadNames),
        correctAnswer: rad.name,
        acceptedTyping: [rad.name, ...rad.name.split('/')],
        explanation: `Gốc acid <b>${rad.formula}</b> có tên là <b>${rad.name}</b>, hóa trị <b>${rad.valence}</b> (tạo bởi ${rad.parentAcid}).`
      });

      // Dạng 5: Gốc acid -> Hóa trị
      questionPool.push({
        category: 'Hóa Trị Gốc Acid',
        question: `Hóa trị của gốc acid <span class="highlight">${rad.formula}</span> (${rad.name}) là bao nhiêu?`,
        promptTyping: `Gõ hóa trị của gốc acid <span class="highlight">${rad.formula}</span> (${rad.name}) (ví dụ: I, II, III hoặc 1, 2, 3):`,
        speakWord: rad.name,
        options: makeOptions(rad.valence, ['I', 'II', 'III', 'IV']),
        correctAnswer: rad.valence,
        acceptedTyping: [rad.valence, String(rad.valenceNum)],
        explanation: `Gốc acid <b>${rad.formula}</b> (${rad.name}) có hóa trị <b>${rad.valence}</b>.`
      });

      // Dạng 6: Tên gốc -> Công thức gốc
      questionPool.push({
        category: 'Công Thức Gốc Acid',
        question: `Công thức của gốc acid <span class="highlight">${rad.name}</span> là gì?`,
        promptTyping: `Gõ công thức của gốc acid <span class="highlight">${rad.name}</span>:`,
        speakWord: rad.name,
        options: makeOptions(rad.formula, allRadFormulas),
        correctAnswer: rad.formula,
        acceptedTyping: [rad.formula, rad.formula.replace(/[⁻⁺²³⁴]/g, '')],
        explanation: `Gốc acid <b>${rad.name}</b> có công thức là <b>${rad.formula}</b> (hóa trị ${rad.valence}).`
      });

      // Dạng 7: Gốc acid -> Acid nguồn gốc
      questionPool.push({
        category: 'Nguồn Gốc Acid',
        question: `Gốc acid <span class="highlight">${rad.formula}</span> (${rad.name}) xuất phát từ acid nào?`,
        promptTyping: `Gõ công thức acid tạo ra gốc <span class="highlight">${rad.formula}</span> (${rad.name}):`,
        speakWord: rad.parentAcidName,
        options: makeOptions(rad.parentAcid, allAcidFormulas),
        correctAnswer: rad.parentAcid,
        acceptedTyping: [rad.parentAcid, rad.parentAcidName],
        explanation: `Gốc <b>${rad.formula}</b> (${rad.name}) xuất phát từ acid <b>${rad.parentAcid}</b> (${rad.parentAcidName}).`
      });
    });

    // 3. NHÓM KIM LOẠI (17 kim loại x 5 dạng = 85 câu)
    const allMetalNames = CHEMISTRY_DATA.metals.map(m => m.enName);
    const allMetalSymbols = CHEMISTRY_DATA.metals.map(m => m.symbol);
    const allPhrases = CHEMISTRY_DATA.metals.map(m => m.phrase);
    const allValences = CHEMISTRY_DATA.metals.map(m => m.valence);

    CHEMISTRY_DATA.metals.forEach(m => {
      // Dạng 8: Ký hiệu -> Tên tiếng Anh
      questionPool.push({
        category: 'Tên Kim Loại (IUPAC)',
        question: `Kim loại có ký hiệu hóa học <span class="highlight">${m.symbol}</span> có tên tiếng Anh là gì?`,
        promptTyping: `Gõ tên tiếng Anh chuẩn IUPAC của kim loại <span class="highlight">${m.symbol}</span>:`,
        speakWord: m.enName,
        options: makeOptions(m.enName, allMetalNames),
        correctAnswer: m.enName,
        acceptedTyping: [m.enName, m.alias || ''],
        explanation: `Ký hiệu <b>${m.symbol}</b> là kim loại <b>${m.enName}</b>.`
      });

      // Dạng 9: Tên tiếng Anh -> Ký hiệu
      questionPool.push({
        category: 'Ký Hiệu Kim Loại',
        question: `Ký hiệu hóa học của nguyên tố <span class="highlight">${m.enName}</span> là gì?`,
        promptTyping: `Gõ ký hiệu hóa học của nguyên tố <span class="highlight">${m.enName}</span>:`,
        speakWord: m.enName,
        options: makeOptions(m.symbol, allMetalSymbols),
        correctAnswer: m.symbol,
        acceptedTyping: [m.symbol],
        explanation: `Nguyên tố <b>${m.enName}</b> có ký hiệu hóa học là <b>${m.symbol}</b>.`
      });

      // Dạng 10: Ký hiệu -> Từ câu nhớ
      questionPool.push({
        category: 'Thần Chú Dãy Kim Loại',
        question: `Trong câu thần chú dãy hoạt động kim loại, nguyên tố <span class="highlight">${m.symbol}</span> (${m.enName}) ứng với từ nào?`,
        promptTyping: `Gõ từ trong câu thần chú ứng với kim loại <span class="highlight">${m.symbol}</span> (${m.enName}):`,
        speakWord: m.enName,
        options: makeOptions(m.phrase, allPhrases),
        correctAnswer: m.phrase,
        acceptedTyping: [m.phrase],
        explanation: `Nguyên tố <b>${m.symbol}</b> (${m.enName}) đứng vị trí số ${m.stt}, ứng với từ "<b>${m.phrase}</b>".`
      });

      // Dạng 11: Từ câu nhớ -> Ký hiệu
      questionPool.push({
        category: 'Giải Mã Thần Chú Kim Loại',
        question: `Trong câu thần chú, từ "<b>${m.phrase}</b>" ứng với kim loại nào?`,
        promptTyping: `Trong câu thần chú, từ "<b>${m.phrase}</b>" là kim loại nào? (Gõ ký hiệu hóa học):`,
        speakWord: m.enName,
        options: makeOptions(m.symbol, allMetalSymbols),
        correctAnswer: m.symbol,
        acceptedTyping: [m.symbol, m.enName],
        explanation: `Từ "<b>${m.phrase}</b>" ứng với nguyên tố <b>${m.symbol}</b> (${m.enName}).`
      });

      // Dạng 12: Kim loại -> Hóa trị
      questionPool.push({
        category: 'Hóa Trị Kim Loại',
        question: `Hóa trị thường gặp của kim loại <span class="highlight">${m.symbol}</span> (${m.enName}) là gì?`,
        promptTyping: `Gõ hóa trị thường gặp của kim loại <span class="highlight">${m.symbol}</span> (${m.enName}):`,
        speakWord: m.enName,
        options: makeOptions(m.valence, allValences),
        correctAnswer: m.valence,
        acceptedTyping: [m.valence, m.valence.replace(/ /g, ''), m.valenceArr ? m.valenceArr.join(', ') : ''],
        explanation: `Kim loại <b>${m.symbol}</b> (${m.enName}) có hóa trị thường gặp là <b>${m.valence}</b>.`
      });
    });

    // Trộn ngẫu nhiên câu hỏi
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);

    // Gán định dạng (typing hoặc choice) theo formatMode
    shuffled.forEach((q, idx) => {
      if (formatMode === 'typing') {
        q.format = 'typing';
      } else if (formatMode === 'choice') {
        q.format = 'choice';
      } else {
        // mixed: xen kẽ 50% gõ bàn phím và 50% trắc nghiệm
        q.format = idx % 2 === 0 ? 'typing' : 'choice';
      }
    });

    // Cắt số lượng theo countMode
    if (countMode === 'all') {
      return shuffled;
    } else {
      const n = parseInt(countMode) || 20;
      return shuffled.slice(0, Math.min(n, shuffled.length));
    }
  }

  startQuizSession() {
    clearInterval(this.quizState.timerInterval);
    this.quizState.questions = this.generateQuizQuestions();
    this.quizState.currentIndex = 0;
    this.quizState.correctCount = 0;
    this.quizState.currentScore = 0;
    this.quizState.isAnswered = false;

    const totalQ = this.quizState.questions.length;
    this.quizState.pointsPerQuestion = totalQ > 0 ? (100 / totalQ) : 0;
    document.getElementById('quizTotalNum').textContent = totalQ;
    this.updateQuizScoreUI(false);
    this.loadQuizQuestion(0);
  }

  loadQuizQuestion(index) {
    clearInterval(this.quizState.timerInterval);
    this.quizState.currentIndex = index;
    this.quizState.isAnswered = false;
    this.quizState.timer = this.quizState.maxTimer || 30;

    const q = this.quizState.questions[index];
    document.getElementById('quizCurrentNum').textContent = index + 1;
    document.getElementById('quizCategory').textContent = `Chủ đề: ${q.category} • Dạng bài: ${q.format === 'typing' ? '⌨️ Gõ Bàn Phím' : '🔘 Trắc Nghiệm'}`;

    const questionHtml = q.format === 'typing' ? q.promptTyping : q.question;
    document.getElementById('quizQuestionText').innerHTML = `
      ${questionHtml}
      ${q.speakWord ? `<button class="speaker-btn-inline" id="quizSpeakerBtn" title="Nghe phát âm">🔊</button>` : ''}
    `;

    if (q.speakWord) {
      document.getElementById('quizSpeakerBtn').onclick = (e) => {
        e.stopPropagation();
        soundManager.speak(q.speakWord);
      };
    }

    // Hide explanation and Next button
    const expBox = document.getElementById('quizExplanation');
    expBox.style.display = 'none';
    expBox.innerHTML = '';
    document.getElementById('quizNextBtn').style.display = 'none';

    const optContainer = document.getElementById('quizOptionsContainer');
    const typingContainer = document.getElementById('quizTypingContainer');

    if (q.format === 'typing') {
      // HIỂN THỊ KHUNG GÕ BÀN PHÍM
      optContainer.style.display = 'none';
      typingContainer.style.display = 'flex';

      const input = document.getElementById('quizTypingInput');
      input.value = '';
      input.disabled = false;
      input.className = 'quiz-typing-input';
      document.getElementById('quizSubmitTypingBtn').disabled = false;

      setTimeout(() => input.focus(), 50);
    } else {
      // HIỂN THỊ TRẮC NGHIỆM A B C D
      optContainer.style.display = 'grid';
      typingContainer.style.display = 'none';
      optContainer.innerHTML = '';

      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `
          <span class="opt-prefix">${letters[optIdx]}</span>
          <span>${optText}</span>
        `;
        btn.onclick = () => this.handleQuizAnswer(optText, btn, q);
        optContainer.appendChild(btn);
      });
    }

    // Start Timer
    this.updateTimerBar();
    this.quizState.timerInterval = setInterval(() => {
      this.quizState.timer -= 0.1;
      this.updateTimerBar();

      if (this.quizState.timer <= 0) {
        clearInterval(this.quizState.timerInterval);
        this.handleQuizTimeout(q);
      }
    }, 100);

    // Next Button listener
    document.getElementById('quizNextBtn').onclick = () => {
      soundManager.playClick();
      if (this.quizState.currentIndex + 1 < this.quizState.questions.length) {
        this.loadQuizQuestion(this.quizState.currentIndex + 1);
      } else {
        // Hoàn thành bộ câu hỏi
        const totalQ = this.quizState.questions.length;
        const accuracy = Math.round((this.quizState.correctCount / totalQ) * 100);
        const finalScore = this.quizState.currentScore;

        if (finalScore > this.bestQuizScore) {
          this.bestQuizScore = finalScore;
          localStorage.setItem('chemmaster_best_quiz_score', this.bestQuizScore);
          this.updateScoreUI();
        }

        const modalTitle = finalScore === 100 ? 'Điểm Tuyệt Đối 100/100! 🌟' : 'Hoàn Thành Đấu Trường!';
        const modalDesc = `Bạn đã hoàn thành lượt chơi với ${this.quizState.correctCount}/${totalQ} câu đúng!`;

        this.showVictoryModal(
          modalTitle,
          modalDesc,
          `${finalScore}/100 Điểm`,
          `${totalQ} câu`,
          `${accuracy}%`
        );
      }
    };
  }

  updateTimerBar() {
    const bar = document.getElementById('quizTimerBar');
    const timerVal = document.getElementById('quizTimerVal');
    const maxTime = this.quizState.maxTimer || 30;
    const pct = Math.max(0, (this.quizState.timer / maxTime) * 100);
    bar.style.width = `${pct}%`;
    timerVal.textContent = Math.ceil(this.quizState.timer);

    if (this.quizState.timer <= Math.min(5, maxTime * 0.2)) {
      bar.className = 'timer-bar danger';
    } else if (this.quizState.timer <= Math.min(10, maxTime * 0.4)) {
      bar.className = 'timer-bar warning';
    } else {
      bar.className = 'timer-bar';
    }
  }

  handleQuizAnswer(selectedOption, selectedBtn, question) {
    if (this.quizState.isAnswered) return;
    this.quizState.isAnswered = true;
    clearInterval(this.quizState.timerInterval);

    const isCorrect = selectedOption === question.correctAnswer;
    const allOptionBtns = document.querySelectorAll('.quiz-option-btn');

    allOptionBtns.forEach(btn => {
      btn.disabled = true;
      if (btn.querySelector('span:last-child').textContent === question.correctAnswer) {
        btn.classList.add('correct');
      }
    });

    if (isCorrect) {
      selectedBtn.classList.add('correct');
      soundManager.playCorrect();
      if (question.speakWord) soundManager.speak(question.speakWord);
      this.quizState.correctCount++;

      // Tính điểm theo thang 100 chia đều
      const totalQ = this.quizState.questions.length;
      if (this.quizState.correctCount === totalQ) {
        this.quizState.currentScore = 100;
      } else {
        const rawScore = (this.quizState.correctCount / totalQ) * 100;
        this.quizState.currentScore = Number.isInteger(rawScore) ? rawScore : parseFloat(rawScore.toFixed(1));
      }
      this.updateQuizScoreUI(true);

      if (this.quizState.currentScore > this.bestQuizScore) {
        this.bestQuizScore = this.quizState.currentScore;
        localStorage.setItem('chemmaster_best_quiz_score', this.bestQuizScore);
        this.updateScoreUI();
      }

      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
        localStorage.setItem('chemmaster_max_streak', this.maxStreak);
      }
      const streakEl = document.getElementById('streakDisplay');
      if (streakEl) streakEl.textContent = this.currentStreak;
    } else {
      selectedBtn.classList.add('wrong');
      soundManager.playWrong();
      this.resetStreak();
    }

    // Show Explanation
    const expBox = document.getElementById('quizExplanation');
    expBox.innerHTML = `💡 <b>Giải thích:</b> ${question.explanation}`;
    expBox.style.display = 'block';

    document.getElementById('quizNextBtn').style.display = 'inline-flex';
  }

  submitTypingAnswer(question) {
    if (this.quizState.isAnswered) return;
    const inputEl = document.getElementById('quizTypingInput');
    const userVal = inputEl.value.trim();
    if (!userVal) {
      inputEl.focus();
      return;
    }

    this.quizState.isAnswered = true;
    clearInterval(this.quizState.timerInterval);

    const isCorrect = this.isAnswerMatching(userVal, question.acceptedTyping || [question.correctAnswer]);
    inputEl.disabled = true;
    document.getElementById('quizSubmitTypingBtn').disabled = true;

    if (isCorrect) {
      inputEl.classList.add('correct');
      soundManager.playCorrect();
      if (question.speakWord) soundManager.speak(question.speakWord);
      this.quizState.correctCount++;

      // Tính điểm theo thang 100 chia đều
      const totalQ = this.quizState.questions.length;
      if (this.quizState.correctCount === totalQ) {
        this.quizState.currentScore = 100;
      } else {
        const rawScore = (this.quizState.correctCount / totalQ) * 100;
        this.quizState.currentScore = Number.isInteger(rawScore) ? rawScore : parseFloat(rawScore.toFixed(1));
      }
      this.updateQuizScoreUI(true);

      if (this.quizState.currentScore > this.bestQuizScore) {
        this.bestQuizScore = this.quizState.currentScore;
        localStorage.setItem('chemmaster_best_quiz_score', this.bestQuizScore);
        this.updateScoreUI();
      }

      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
        localStorage.setItem('chemmaster_max_streak', this.maxStreak);
      }
      const streakEl = document.getElementById('streakDisplay');
      if (streakEl) streakEl.textContent = this.currentStreak;
    } else {
      inputEl.classList.add('wrong');
      soundManager.playWrong();
      this.resetStreak();
    }

    const expBox = document.getElementById('quizExplanation');
    const feedbackHeader = isCorrect 
      ? `✅ <b>Chính xác!</b> Bạn đã nhập đúng.` 
      : `❌ <b>Chưa chính xác!</b> Bạn nhập: "<i>${userVal}</i>" • Đáp án đúng: "<b>${question.correctAnswer}</b>"`;
    expBox.innerHTML = `${feedbackHeader}<br>💡 <b>Giải thích:</b> ${question.explanation}`;
    expBox.style.display = 'block';

    document.getElementById('quizNextBtn').style.display = 'inline-flex';
  }

  handleQuizTimeout(question) {
    if (this.quizState.isAnswered) return;
    this.quizState.isAnswered = true;
    soundManager.playWrong();
    this.resetStreak();

    if (question.format === 'typing') {
      const inputEl = document.getElementById('quizTypingInput');
      inputEl.disabled = true;
      inputEl.classList.add('wrong');
      document.getElementById('quizSubmitTypingBtn').disabled = true;

      const expBox = document.getElementById('quizExplanation');
      expBox.innerHTML = `⏰ <b>Hết giờ!</b> Đáp án đúng là: "<b>${question.correctAnswer}</b>".<br>💡 <b>Giải thích:</b> ${question.explanation}`;
      expBox.style.display = 'block';
    } else {
      const allOptionBtns = document.querySelectorAll('.quiz-option-btn');
      allOptionBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.querySelector('span:last-child').textContent === question.correctAnswer) {
          btn.classList.add('correct');
        }
      });

      const expBox = document.getElementById('quizExplanation');
      expBox.innerHTML = `⏰ <b>Hết giờ!</b> Đáp án đúng là: "<b>${question.correctAnswer}</b>".<br>💡 <b>Giải thích:</b> ${question.explanation}`;
      expBox.style.display = 'block';
    }

    document.getElementById('quizNextBtn').style.display = 'inline-flex';
  }

  // ========================================================
  // MODE 4: FLASHCARD 3D & BẢNG TRA CỨU
  // ========================================================
  initFlashcards() {
    const fcCard = document.getElementById('flashcardElement');
    const switchDeckBtn = document.getElementById('switchFcDeckBtn');
    const fcPrevBtn = document.getElementById('fcPrevBtn');
    const fcNextBtn = document.getElementById('fcNextBtn');
    const fcFlipBtn = document.getElementById('fcFlipBtn');
    const fcSpeakBtn = document.getElementById('fcSpeakBtn');

    // Click to flip
    const toggleFlip = () => {
      soundManager.playClick();
      this.flashcardState.isFlipped = !this.flashcardState.isFlipped;
      fcCard.classList.toggle('flipped', this.flashcardState.isFlipped);
    };

    fcCard.addEventListener('click', toggleFlip);
    fcFlipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFlip();
    });

    // Switch Deck
    switchDeckBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.flashcardState.deckType = this.flashcardState.deckType === 'acids' ? 'metals' : 'acids';
      this.flashcardState.currentIndex = 0;
      this.flashcardState.isFlipped = false;
      fcCard.classList.remove('flipped');
      document.getElementById('fcDeckName').textContent = this.flashcardState.deckType === 'acids' 
        ? 'Đổi sang: Dãy Kim Loại' 
        : 'Đổi sang: Bảng Acid';
      this.renderCurrentFlashcard();
    });

    // Navigation
    fcPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      const list = this.flashcardState.deckType === 'acids' ? CHEMISTRY_DATA.acids : CHEMISTRY_DATA.metals;
      this.flashcardState.currentIndex = (this.flashcardState.currentIndex - 1 + list.length) % list.length;
      this.renderCurrentFlashcard();
    });

    fcNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      const list = this.flashcardState.deckType === 'acids' ? CHEMISTRY_DATA.acids : CHEMISTRY_DATA.metals;
      this.flashcardState.currentIndex = (this.flashcardState.currentIndex + 1) % list.length;
      this.renderCurrentFlashcard();
    });

    // Pronunciation
    fcSpeakBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentItem = this.flashcardState.deckType === 'acids' 
        ? CHEMISTRY_DATA.acids[this.flashcardState.currentIndex]
        : CHEMISTRY_DATA.metals[this.flashcardState.currentIndex];
      soundManager.speak(currentItem.name || currentItem.enName);
    });

    this.renderCurrentFlashcard();
  }

  renderCurrentFlashcard() {
    const isAcids = this.flashcardState.deckType === 'acids';
    const list = isAcids ? CHEMISTRY_DATA.acids : CHEMISTRY_DATA.metals;
    const item = list[this.flashcardState.currentIndex];

    document.getElementById('fcCounter').textContent = `${this.flashcardState.currentIndex + 1} / ${list.length}`;

    if (isAcids) {
      document.getElementById('fcTypeBadge').textContent = item.type === 'Mạnh' ? 'Acid Mạnh' : 'Acid Yếu';
      document.getElementById('fcTypeBadge').className = item.type === 'Mạnh' ? 'badge-tag badge-strong' : 'badge-tag badge-weak';
      document.getElementById('fcFormula').innerHTML = item.htmlFormula;
      document.getElementById('fcSub').textContent = item.name;

      document.getElementById('fcBackCategory').textContent = 'Gốc Acid & Hóa Trị';
      const radicalsHtml = item.radicals.map(r => `
        <div style="margin: 8px 0; padding: 6px 12px; background: rgba(255,255,255,0.06); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; color: var(--neon-cyan);">${r.formula}</span>
          <span style="font-weight: 600; color: #fff;">${r.name}</span>
          <span class="badge-tag badge-valence">Hóa trị ${r.valence}</span>
        </div>
      `).join('');
      document.getElementById('fcBackDetails').innerHTML = radicalsHtml;
    } else {
      document.getElementById('fcTypeBadge').textContent = item.category;
      document.getElementById('fcTypeBadge').className = 'badge-tag badge-metal';
      document.getElementById('fcFormula').textContent = item.symbol;
      document.getElementById('fcSub').textContent = item.enName;

      document.getElementById('fcBackCategory').textContent = 'Dãy Hoạt Động & Hóa Trị';
      document.getElementById('fcBackDetails').innerHTML = `
        <div style="font-size: 1.15rem; color: #fff; margin-bottom: 8px;">
          Câu nhớ: <b style="color: var(--neon-cyan); font-size: 1.4rem;">${item.phrase}</b>
        </div>
        <div style="margin: 6px 0; color: var(--text-muted);">
          Thứ tự trong dãy: <b style="color: #fff;">#${item.stt}</b>
        </div>
        <div style="margin-top: 10px;">
          Hóa trị thường gặp: <span class="badge-tag badge-valence" style="font-size: 1.1rem; padding: 4px 14px;">${item.valence}</span>
        </div>
      `;
    }
  }

  // ========================================================
  // DATABASE TABLE & SEARCH
  // ========================================================
  initChemTable() {
    this.renderChemTable('all', '');

    const searchInput = document.getElementById('chemSearchInput');
    const filterTags = document.querySelectorAll('.filter-tag');

    let currentFilter = 'all';

    searchInput.addEventListener('input', (e) => {
      this.renderChemTable(currentFilter, e.target.value.trim().toLowerCase());
    });

    filterTags.forEach(tag => {
      tag.addEventListener('click', () => {
        soundManager.playClick();
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        currentFilter = tag.getAttribute('data-filter');
        this.renderChemTable(currentFilter, searchInput.value.trim().toLowerCase());
      });
    });
  }

  renderChemTable(filter, searchQuery) {
    const tbody = document.getElementById('chemTableBody');
    tbody.innerHTML = '';

    let rows = [];

    // Rows from Acids
    CHEMISTRY_DATA.acids.forEach(acid => {
      acid.radicals.forEach((rad, rIdx) => {
        rows.push({
          type: 'acid',
          subType: acid.type === 'Mạnh' ? 'acid-strong' : 'acid-weak',
          formula: acid.formula,
          htmlFormula: acid.htmlFormula,
          name: acid.name,
          categoryBadge: `<span class="badge-tag ${acid.type === 'Mạnh' ? 'badge-strong' : 'badge-weak'}">${acid.type}</span>`,
          radicalFormula: rad.formula,
          valenceBadge: `<span class="badge-tag badge-valence">${rad.valence}</span>`,
          radicalName: rad.name,
          speakWord: acid.name,
          radicalSpeakWord: rad.name,
          isFirstRadical: rIdx === 0,
          radicalCount: acid.radicals.length
        });
      });
    });

    // Rows from Metals
    CHEMISTRY_DATA.metals.forEach(m => {
      rows.push({
        type: 'metal',
        subType: 'metals',
        formula: m.symbol,
        htmlFormula: m.symbol,
        name: m.enName,
        categoryBadge: `<span class="badge-tag badge-metal">#${m.stt} "${m.phrase}"</span>`,
        radicalFormula: '-',
        valenceBadge: `<span class="badge-tag badge-valence">${m.valence}</span>`,
        radicalName: m.category,
        speakWord: m.enName,
        radicalSpeakWord: null
      });
    });

    // Filter by category
    if (filter === 'acid-strong') {
      rows = rows.filter(r => r.subType === 'acid-strong');
    } else if (filter === 'acid-weak') {
      rows = rows.filter(r => r.subType === 'acid-weak');
    } else if (filter === 'metals') {
      rows = rows.filter(r => r.type === 'metal');
    } else if (filter === 'radicals') {
      rows = rows.filter(r => r.type === 'acid');
    }

    // Filter by search query
    if (searchQuery) {
      rows = rows.filter(r => {
        return r.formula.toLowerCase().includes(searchQuery) ||
               r.name.toLowerCase().includes(searchQuery) ||
               (r.radicalFormula && r.radicalFormula.toLowerCase().includes(searchQuery)) ||
               (r.radicalName && r.radicalName.toLowerCase().includes(searchQuery));
      });
    }

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 30px;">Không tìm thấy kết quả phù hợp</td></tr>`;
      return;
    }

    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="formula-cell">${r.htmlFormula}</td>
        <td style="font-weight: 600; color: #fff;">${r.name}</td>
        <td>${r.categoryBadge}</td>
        <td><b style="color: var(--neon-cyan); font-family: var(--font-mono); margin-right: 8px;">${r.radicalFormula}</b> ${r.valenceBadge}</td>
        <td>${r.radicalName}</td>
        <td>
          <button class="speaker-btn-inline" title="Phát âm tiếng Anh">🔊</button>
        </td>
      `;

      tr.querySelector('.speaker-btn-inline').addEventListener('click', (e) => {
        e.stopPropagation();
        soundManager.speak(r.speakWord);
      });

      tbody.appendChild(tr);
    });
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChemMasterApp();
});
