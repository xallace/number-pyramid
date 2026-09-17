/* ==========================================================================
   Modernized Number Pyramid & Pascal Laboratory (App Controller & UI)
   A modern, responsive, high-fidelity arithmetic simulator honoring Walter Fendt
   ========================================================================== */

(function () {
    'use strict';

    const I18N = {
        en: {
            title: "NUMBER PYRAMID & PASCAL LAB",
            subtitle: "Interactive additive arithmetic, algebraic deduction & binomial combinatorics",
            lang_label: "EN",
            theory: "Theory",
            new_puzzle: "New Puzzle",
            check: "Check",
            hint: "Hint",
            solve: "Solve All",
            clear: "Clear",
            sandbox: "Sandbox Mode",
            puzzle_mode: "Puzzle Mode",
            binomial_toggle: "Pascal View",
            numpad_toggle: "Numpad",
            validate_live: "Live Check",
            height_label: "Pyramid Height:",
            difficulty_label: "Difficulty:",
            domain_label: "Number Set:",
            diff_novice: "Novice (Bottom Only)",
            diff_intermediate: "Intermediate (Deduction)",
            diff_master: "Master (Algebraic)",
            domain_natural: "Natural (ℕ₀)",
            domain_integers: "Integers (ℤ ±)",
            domain_decimals: "Decimals (0.5)",
            status_solved: "🎉 Solved! Excellent mathematical deduction!",
            status_progress: "Stones Solved: ",
            hint_heading: "Mathematical Deduction Step",
            telemetry_heading: "Pyramid Telemetry",
            pascal_heading: "Binomial Expansion (Pascal's Triangle)",
            theory_title: "Mathematics of the Number Pyramid",
            theory_content: `
                <p><strong>The Core Rule:</strong><br>
                In a number pyramid (or addition wall), each stone is the sum of the two stones immediately beneath it:</p>
                <div class="math-block">C = A + B</div>
                <p>Equivalently, knowing a parent stone and one child yields the missing child via subtraction:</p>
                <div class="math-block">A = C - B &emsp; \text{and} &emsp; B = C - A</div>
                
                <p><strong>Connection to Pascal's Triangle & Binomial Coefficients:</strong><br>
                A remarkable mathematical property connects number pyramids directly to <strong>combinatorics</strong>. If the base row has values $b_1, b_2, \dots, b_H$, any stone at row $r$ and column $c$ is a linear combination of the base stones:</p>
                <div class="math-block">V(r, c) = \sum_{k=0}^{H - 1 - r} \binom{H - 1 - r}{k} b_{c + k}</div>
                <p>For example, in a 4-row pyramid, the top stone $T$ is:</p>
                <div class="math-block">T = 1\cdot b_1 + 3\cdot b_2 + 3\cdot b_3 + 1\cdot b_4</div>
                <p>The coefficients $(1, 3, 3, 1)$ are precisely the 3rd row of <strong>Pascal's Triangle</strong>!</p>
                
                <p class="attribution">Originally developed as an educational applet by <strong>Walter Fendt</strong> (1997–2023). Modernized with responsive DOM brick layout, inline typing, algebraic solvers, binomial formulas, and Web Audio API.</p>
            `
        },
        de: {
            title: "ZAHLENPYRAMIDE & PASCAL-LABOR",
            subtitle: "Interaktive additive Arithmetik, algebraische Deduktion & Binomial-Kombinatorik",
            lang_label: "DE",
            theory: "Theorie",
            new_puzzle: "Neues Rätsel",
            check: "Prüfen",
            hint: "Tipp",
            solve: "Lösung zeigen",
            clear: "Leeren",
            sandbox: "Sandkasten",
            puzzle_mode: "Rätsel-Modus",
            binomial_toggle: "Pascal-Ansicht",
            numpad_toggle: "Ziffernblock",
            validate_live: "Live-Prüfung",
            height_label: "Höhe der Pyramide:",
            difficulty_label: "Schwierigkeit:",
            domain_label: "Zahlenbereich:",
            diff_novice: "Anfänger (Nur Basis)",
            diff_intermediate: "Fortgeschritten (Deduktion)",
            diff_master: "Meister (Algebraisch)",
            domain_natural: "Natürliche Zahlen (ℕ₀)",
            domain_integers: "Ganze Zahlen (ℤ ±)",
            domain_decimals: "Dezimalzahlen (0.5)",
            status_solved: "🎉 Gelöst! Perfekt kombiniert und gerechnet!",
            status_progress: "Steine gelöst: ",
            hint_heading: "Mathematischer Rechenschritt",
            telemetry_heading: "Pyramiden-Telemetrie",
            pascal_heading: "Binomial-Entwicklung (Pascalsches Dreieck)",
            theory_title: "Mathematik der Zahlenpyramide",
            theory_content: `
                <p><strong>Die Grundregel:</strong><br>
                In einer Zahlenpyramide (oder Rechenmauer) ist die Zahl in jedem Stein immer gleich der Summe der beiden unmittelbar darunter liegenden Steine:</p>
                <div class="math-block">C = A + B</div>
                <p>Umgekehrt lässt sich aus einem oberen Stein und einem unteren Stein der fehlende Partner durch Subtraktion berechnen:</p>
                <div class="math-block">A = C - B &emsp; \text{und} &emsp; B = C - A</div>
                
                <p><strong>Zusammenhang mit dem Pascalschen Dreieck & Binomialkoeffizienten:</strong><br>
                Hinter der einfachen Addition verbirgt sich eine tiefe Verbindung zur <strong>Kombinatorik</strong>. Bezeichnet man die Basissteine mit $b_1, b_2, \dots, b_H$, so ist jeder Stein $(r, c)$ eine Linearkombination der darunterliegenden Basissteine:</p>
                <div class="math-block">V(r, c) = \sum_{k=0}^{H - 1 - r} \binom{H - 1 - r}{k} b_{c + k}</div>
                <p>In einer 4-stöckigen Pyramide berechnet sich der Deckstein $T$ beispielsweise als:</p>
                <div class="math-block">T = 1\cdot b_1 + 3\cdot b_2 + 3\cdot b_3 + 1\cdot b_4</div>
                <p>Die Koeffizienten $(1, 3, 3, 1)$ entsprechen exakt der 3. Zeile des <strong>Pascalschen Dreiecks</strong>!</p>
                
                <p class="attribution">Ursprünglich als didaktische Simulation entwickelt von <strong>Walter Fendt</strong> (1997–2023). Modernisiert mit responsivem Ziegelstein-Layout, direkter Tastatureingabe, algebraischem Löser, Pascal-Formeln und Web Audio API.</p>
            `
        }
    };

    // Global application state
    const app = {
        lang: localStorage.getItem('agy_pyramid_lang') || 'de',
        theme: localStorage.getItem('agy_pyramid_theme') || 'dark',
        engine: new PyramidEngine(),

        // Options
        isSandbox: false,
        showBinomial: false,
        showNumpad: false,
        liveValidation: true,

        // Active focus & hint
        activeCell: null, // { row, col }
        activeHintCell: null, // { row, col }
        timerInterval: null,
        secondsElapsed: 0
    };

    function init() {
        applyTheme(app.theme);
        applyLanguage(app.lang);

        setupEventListeners();

        // Generate initial puzzle
        generateNewGame();

        // Start timer
        startTimer();
    }

    function generateNewGame() {
        app.activeCell = null;
        app.activeHintCell = null;
        app.secondsElapsed = 0;
        updateTimerDisplay();

        app.engine.generatePuzzle();
        renderPyramidBoard();
        updateTelemetry();
        clearHintBox();

        if (window.soundEngine) window.soundEngine.playClick();
    }

    // Render the brick pyramid into DOM
    function renderPyramidBoard() {
        const board = document.getElementById('pyramid-board');
        board.innerHTML = '';

        const H = app.engine.height;

        for (let r = 0; r < H; r++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'pyramid-row';
            rowEl.setAttribute('data-row', r);

            for (let c = 0; c <= r; c++) {
                const isClue = app.engine.initialClues[r][c];
                const userVal = app.engine.userGrid[r][c];

                const brick = document.createElement('div');
                brick.className = `brick ${isClue ? 'clue' : 'user-stone'}`;
                brick.setAttribute('data-row', r);
                brick.setAttribute('data-col', c);
                brick.setAttribute('tabindex', isClue ? '-1' : '0');

                // Coordinate small badge
                const badge = document.createElement('span');
                badge.className = 'brick-coord';
                badge.innerText = `r${r + 1}c${c + 1}`;
                brick.appendChild(badge);

                if (isClue) {
                    const valSpan = document.createElement('span');
                    valSpan.className = 'brick-val';
                    valSpan.innerText = userVal !== null ? userVal : '';
                    brick.appendChild(valSpan);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'brick-input';
                    input.inputMode = 'decimal';
                    input.autocomplete = 'off';
                    input.spellcheck = false;
                    input.value = userVal !== null ? userVal : '';
                    input.setAttribute('aria-label', `Row ${r + 1} Column ${c + 1}`);

                    // Input listeners
                    input.addEventListener('focus', () => {
                        setActiveBrick(r, c);
                        if (window.soundEngine) window.soundEngine.playClick();
                    });

                    input.addEventListener('input', (e) => {
                        handleBrickInput(r, c, e.target.value);
                    });

                    input.addEventListener('keydown', (e) => {
                        handleBrickKeyDown(e, r, c);
                    });

                    brick.appendChild(input);
                }

                // Binomial Formula overlay element
                const binomialText = app.engine.getBinomialExpansion(r, c);
                const formulaBadge = document.createElement('div');
                formulaBadge.className = 'binomial-tag';
                formulaBadge.innerText = binomialText.replace(`V(${r + 1}, ${c + 1}) = `, '');
                brick.appendChild(formulaBadge);

                // Brick click focusing
                brick.addEventListener('click', () => {
                    if (!isClue) {
                        const inp = brick.querySelector('.brick-input');
                        if (inp) inp.focus();
                    } else {
                        setActiveBrick(r, c);
                    }
                });

                rowEl.appendChild(brick);
            }

            board.appendChild(rowEl);
        }

        // Focus first empty input
        focusFirstEmptyBrick();
    }

    function setActiveBrick(r, c) {
        app.activeCell = { row: r, col: c };

        // Highlight active and related parents/children
        document.querySelectorAll('.brick').forEach(b => {
            b.classList.remove('active', 'parent-highlight', 'child-highlight');
        });

        const activeBrick = document.querySelector(`.brick[data-row="${r}"][data-col="${c}"]`);
        if (activeBrick) activeBrick.classList.add('active');

        // Highlight children if r < H - 1
        if (r < app.engine.height - 1) {
            const leftChild = document.querySelector(`.brick[data-row="${r + 1}"][data-col="${c}"]`);
            const rightChild = document.querySelector(`.brick[data-row="${r + 1}"][data-col="${c + 1}"]`);
            if (leftChild) leftChild.classList.add('child-highlight');
            if (rightChild) rightChild.classList.add('child-highlight');
        }

        // Highlight parents if r > 0
        if (r > 0) {
            if (c > 0) {
                const pLeft = document.querySelector(`.brick[data-row="${r - 1}"][data-col="${c - 1}"]`);
                if (pLeft) pLeft.classList.add('parent-highlight');
            }
            if (c < r) {
                const pRight = document.querySelector(`.brick[data-row="${r - 1}"][data-col="${c}"]`);
                if (pRight) pRight.classList.add('parent-highlight');
            }
        }

        // Update binomial card in sidebar
        updateBinomialSidebar(r, c);
    }

    function handleBrickInput(r, c, textVal) {
        const cleaned = textVal.trim();
        app.engine.setUserValue(r, c, cleaned);

        // Check validation
        if (app.liveValidation) {
            applyValidationHighlights();
        }

        updateTelemetry();

        // Check if fully solved
        if (app.engine.isFullySolved()) {
            handleVictory();
        }
    }

    function handleBrickKeyDown(e, r, c) {
        const H = app.engine.height;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            focusBrick(r, Math.min(r, c + 1));
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            focusBrick(r, Math.max(0, c - 1));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusBrick(Math.min(H - 1, r + 1), Math.min(r + 1, c));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusBrick(Math.max(0, r - 1), Math.min(r - 1, c));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Advance to next empty cell
            advanceToNextEmptyBrick(r, c);
        }
    }

    function focusBrick(r, c) {
        const brick = document.querySelector(`.brick[data-row="${r}"][data-col="${c}"]`);
        if (!brick) return;
        const inp = brick.querySelector('.brick-input');
        if (inp) {
            inp.focus();
            inp.select();
        } else {
            setActiveBrick(r, c);
        }
    }

    function focusFirstEmptyBrick() {
        for (let r = app.engine.height - 1; r >= 0; r--) {
            for (let c = 0; c <= r; c++) {
                if (!app.engine.initialClues[r][c] && app.engine.userGrid[r][c] === null) {
                    focusBrick(r, c);
                    return;
                }
            }
        }
    }

    function advanceToNextEmptyBrick(startR, startC) {
        const H = app.engine.height;
        // Search bottom-to-top or left-to-right
        for (let r = startR; r >= 0; r--) {
            for (let c = (r === startR ? startC + 1 : 0); c <= r; c++) {
                if (!app.engine.initialClues[r][c] && app.engine.userGrid[r][c] === null) {
                    focusBrick(r, c);
                    return;
                }
            }
        }
        // Wrap around
        for (let r = H - 1; r >= 0; r--) {
            for (let c = 0; c <= r; c++) {
                if (!app.engine.initialClues[r][c] && app.engine.userGrid[r][c] === null) {
                    focusBrick(r, c);
                    return;
                }
            }
        }
    }

    // Apply green or red validation markers to bricks
    function applyValidationHighlights() {
        const { validCells, invalidCells } = app.engine.validateGrid();

        document.querySelectorAll('.brick.user-stone').forEach(brick => {
            const r = brick.getAttribute('data-row');
            const c = brick.getAttribute('data-col');
            const key = `${r},${c}`;

            brick.classList.remove('is-valid', 'is-invalid');
            if (validCells.has(key)) {
                brick.classList.add('is-valid');
            } else if (invalidCells.has(key)) {
                brick.classList.add('is-invalid');
            }
        });
    }

    // Step-by-Step Hint Logic
    function provideHint() {
        const hint = app.engine.findNextHint();
        if (!hint) return;

        app.activeHintCell = { row: hint.row, col: hint.col };
        focusBrick(hint.row, hint.col);

        // Highlight hint brick with pulse
        const brick = document.querySelector(`.brick[data-row="${hint.row}"][data-col="${hint.col}"]`);
        if (brick) {
            brick.classList.add('hint-pulse');
            setTimeout(() => brick.classList.remove('hint-pulse'), 1800);

            const inp = brick.querySelector('.brick-input');
            if (inp) {
                inp.value = hint.value;
                app.engine.setUserValue(hint.row, hint.col, hint.value);
                applyValidationHighlights();
                updateTelemetry();
            }
        }

        // Show deduction explanation in HUD
        const hintCard = document.getElementById('hint-display');
        hintCard.classList.add('active');
        document.getElementById('hint-formula').innerText = hint.formula;
        document.getElementById('hint-explanation').innerText = hint.explanation;

        if (window.soundEngine) window.soundEngine.playHint();

        if (app.engine.isFullySolved()) {
            handleVictory();
        }
    }

    function clearHintBox() {
        const hintCard = document.getElementById('hint-display');
        if (hintCard) hintCard.classList.remove('active');
    }

    // Victory handling
    function handleVictory() {
        if (window.soundEngine) window.soundEngine.playVictory();

        const badge = document.getElementById('pyramid-status-badge');
        const t = I18N[app.lang];
        badge.className = 'status-badge solved';
        badge.innerText = t.status_solved;

        triggerCelebrationParticles();
    }

    function triggerCelebrationParticles() {
        const board = document.getElementById('pyramid-board');
        board.classList.add('victory-glow');
        setTimeout(() => board.classList.remove('victory-glow'), 2500);
    }

    // Update Telemetry & Progress
    function updateTelemetry() {
        const filled = app.engine.getFilledCount();
        const total = app.engine.totalStones;
        const pct = Math.round((filled / total) * 100);

        document.getElementById('stat-solved-count').innerText = `${filled} / ${total}`;
        document.getElementById('stat-progress-bar').style.width = `${pct}%`;

        const badge = document.getElementById('pyramid-status-badge');
        const t = I18N[app.lang];

        if (app.engine.isFullySolved()) {
            badge.className = 'status-badge solved';
            badge.innerText = t.status_solved;
        } else {
            badge.className = 'status-badge in-progress';
            badge.innerText = `${t.status_progress} ${filled} / ${total} (${pct}%)`;
        }
    }

    function updateBinomialSidebar(r, c) {
        const formulaEl = document.getElementById('sidebar-binomial-formula');
        if (!formulaEl) return;
        const formula = app.engine.getBinomialExpansion(r, c);
        formulaEl.innerText = formula;
    }

    // Virtual Numpad input handling
    function handleNumpadKey(key) {
        if (!app.activeCell) {
            focusFirstEmptyBrick();
        }
        if (!app.activeCell) return;

        const { row, col } = app.activeCell;
        if (app.engine.initialClues[row][col]) return;

        const brick = document.querySelector(`.brick[data-row="${row}"][data-col="${col}"]`);
        if (!brick) return;
        const input = brick.querySelector('.brick-input');
        if (!input) return;

        if (key === '⌫') {
            input.value = input.value.slice(0, -1);
        } else if (key === 'C') {
            input.value = '';
        } else if (key === '↵') {
            advanceToNextEmptyBrick(row, col);
            return;
        } else {
            input.value += key;
        }

        handleBrickInput(row, col, input.value);
        if (window.soundEngine) window.soundEngine.playClick();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Theme button
        document.getElementById('btn-theme').addEventListener('click', () => {
            applyTheme(app.theme === 'dark' ? 'light' : 'dark');
        });

        // Lang button
        document.getElementById('btn-lang').addEventListener('click', () => {
            applyLanguage(app.lang === 'en' ? 'de' : 'en');
        });

        // Sound button
        document.getElementById('btn-sound').addEventListener('click', () => {
            const enabled = window.soundEngine.toggle();
            document.getElementById('btn-sound').innerHTML = enabled ? '🔊' : '🔇';
        });

        // Theory modal
        document.getElementById('btn-theory').addEventListener('click', toggleTheoryModal);
        document.getElementById('modal-close').addEventListener('click', toggleTheoryModal);
        document.getElementById('modal-backdrop').addEventListener('click', toggleTheoryModal);

        // New Game
        document.getElementById('btn-new-puzzle').addEventListener('click', generateNewGame);

        // Check button
        document.getElementById('btn-check').addEventListener('click', () => {
            applyValidationHighlights();
            if (app.engine.isFullySolved()) {
                handleVictory();
            } else {
                if (window.soundEngine) window.soundEngine.playClick();
            }
        });

        // Hint button
        document.getElementById('btn-hint').addEventListener('click', provideHint);

        // Solve All button
        document.getElementById('btn-solve').addEventListener('click', () => {
            app.engine.solveAll();
            renderPyramidBoard();
            applyValidationHighlights();
            updateTelemetry();
            if (window.soundEngine) window.soundEngine.playCorrect();
        });

        // Clear user entries button
        document.getElementById('btn-clear').addEventListener('click', () => {
            app.engine.clearUserInputs();
            renderPyramidBoard();
            updateTelemetry();
            clearHintBox();
            if (window.soundEngine) window.soundEngine.playClick();
        });

        // Height selector
        const heightSelect = document.getElementById('select-height');
        heightSelect.addEventListener('change', (e) => {
            app.engine.setHeight(e.target.value);
            generateNewGame();
        });

        // Difficulty selector
        const diffSelect = document.getElementById('select-difficulty');
        diffSelect.addEventListener('change', (e) => {
            app.engine.difficulty = e.target.value;
            generateNewGame();
        });

        // Number Set selector
        const domainSelect = document.getElementById('select-domain');
        domainSelect.addEventListener('change', (e) => {
            app.engine.numberSet = e.target.value;
            generateNewGame();
        });

        // Binomial View Toggle
        const binToggle = document.getElementById('toggle-binomial');
        binToggle.addEventListener('change', (e) => {
            app.showBinomial = e.target.checked;
            document.getElementById('pyramid-board').classList.toggle('show-binomial', app.showBinomial);
        });

        // Numpad Toggle
        const numToggle = document.getElementById('toggle-numpad');
        numToggle.addEventListener('change', (e) => {
            app.showNumpad = e.target.checked;
            document.getElementById('virtual-numpad').classList.toggle('active', app.showNumpad);
        });

        // Live validation toggle
        const liveToggle = document.getElementById('toggle-live-check');
        liveToggle.addEventListener('change', (e) => {
            app.liveValidation = e.target.checked;
            if (app.liveValidation) applyValidationHighlights();
            else {
                document.querySelectorAll('.brick').forEach(b => b.classList.remove('is-valid', 'is-invalid'));
            }
        });

        // Numpad keys
        document.querySelectorAll('.num-key').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                handleNumpadKey(key);
            });
        });
    }

    // Timer logic
    function startTimer() {
        if (app.timerInterval) clearInterval(app.timerInterval);
        app.timerInterval = setInterval(() => {
            app.secondsElapsed++;
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const mins = Math.floor(app.secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (app.secondsElapsed % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('stat-timer');
        if (timerEl) timerEl.innerText = `${mins}:${secs}`;
    }

    function toggleTheoryModal() {
        const modal = document.getElementById('theory-modal');
        modal.classList.toggle('active');
    }

    function applyTheme(th) {
        app.theme = th;
        document.documentElement.setAttribute('data-theme', th);
        localStorage.setItem('agy_pyramid_theme', th);
    }

    function applyLanguage(lang) {
        app.lang = lang;
        localStorage.setItem('agy_pyramid_lang', lang);
        const t = I18N[lang];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.innerHTML = t[key];
        });

        document.getElementById('lang-label').innerText = t.lang_label;
        document.getElementById('modal-body-theory').innerHTML = t.theory_content;
    }

    window.addEventListener('DOMContentLoaded', init);
})();
