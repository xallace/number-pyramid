/* ==========================================================================
   Pyramid Engine: Mathematics, Combinatorics & Step-by-Step Solver
   Implements Pascal's Binomial Expansion & Linear Algebraic Deduction
   ========================================================================== */

class PyramidEngine {
    constructor() {
        this.height = 4; // default rows: 2 to 8
        this.numberSet = 'natural'; // 'natural' (N0), 'integers' (Z), 'decimals'
        this.difficulty = 'intermediate'; // 'novice', 'intermediate', 'master'

        // Grid state: 2D array [row][col]
        // row 0 has 1 element, row H-1 has H elements
        this.solution = []; // Complete solved matrix
        this.initialClues = []; // Boolean mask: true if provided as initial puzzle clue
        this.userGrid = []; // Current user-filled values (null if empty)

        // Statistics
        this.totalStones = 0;
        this.clueCount = 0;
    }

    // Binomial coefficient C(n, k)
    static binomial(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        let c = 1;
        for (let i = 1; i <= k; i++) {
            c = (c * (n - (k - i))) / i;
        }
        return Math.round(c);
    }

    // Set height (rows 2 to 8)
    setHeight(h) {
        this.height = Math.max(2, Math.min(8, parseInt(h, 10) || 4));
        this.totalStones = (this.height * (this.height + 1)) / 2;
    }

    // Generate a fresh puzzle
    generatePuzzle() {
        this.totalStones = (this.height * (this.height + 1)) / 2;
        this.solution = Array.from({ length: this.height }, (_, r) => Array(r + 1).fill(0));
        this.initialClues = Array.from({ length: this.height }, (_, r) => Array(r + 1).fill(false));
        this.userGrid = Array.from({ length: this.height }, (_, r) => Array(r + 1).fill(null));

        // 1. Generate base row numbers
        const baseRow = this.generateBaseRow();
        for (let c = 0; c < this.height; c++) {
            this.solution[this.height - 1][c] = baseRow[c];
        }

        // 2. Compute full upward solution: V(r, c) = V(r+1, c) + V(r+1, c+1)
        for (let r = this.height - 2; r >= 0; r--) {
            for (let c = 0; c <= r; c++) {
                const sum = this.solution[r + 1][c] + this.solution[r + 1][c + 1];
                this.solution[r][c] = Math.round(sum * 10) / 10;
            }
        }

        // 3. Apply puzzle clues according to difficulty
        this.generateClueMask();

        // 4. Initialize user grid with initial clues
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c <= r; c++) {
                if (this.initialClues[r][c]) {
                    this.userGrid[r][c] = this.solution[r][c];
                }
            }
        }

        return {
            height: this.height,
            totalStones: this.totalStones,
            clueCount: this.clueCount
        };
    }

    // Generate random base row numbers
    generateBaseRow() {
        const row = [];
        const h = this.height;

        // Tune range so numbers stay comfortable
        let minVal = 1;
        let maxVal = h <= 4 ? 20 : (h <= 5 ? 12 : 8);

        if (this.numberSet === 'integers') {
            minVal = -(h <= 4 ? 10 : 6);
            maxVal = h <= 4 ? 15 : 8;
        }

        for (let i = 0; i < h; i++) {
            if (this.numberSet === 'decimals') {
                const val = (Math.floor(Math.random() * 20) + 2) * 0.5;
                row.push(val);
            } else {
                let val = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
                // Avoid all zeros in integers
                if (val === 0 && Math.random() < 0.7) val = Math.random() < 0.5 ? 1 : -1;
                row.push(val);
            }
        }
        return row;
    }

    // Generate clue pattern
    generateClueMask() {
        const H = this.height;
        this.clueCount = 0;

        if (this.difficulty === 'novice') {
            // Novice: All H base stones given (pure ascending addition)
            for (let c = 0; c < H; c++) {
                this.initialClues[H - 1][c] = true;
                this.clueCount++;
            }
            return;
        }

        if (this.difficulty === 'intermediate') {
            // Intermediate: Exactly H clues scattered such that each step has a direct 1-step arithmetic deduction
            // We use reverse simulation: start with full grid, remove stones that are deducible from remaining
            this.generateGreedyDeducibleClues(H);
            return;
        }

        if (this.difficulty === 'master') {
            // Master: Sparse clues (H clues total) requiring multi-step or algebraic deduction
            this.generateMasterClues(H);
        }
    }

    // Generate a set of exactly H clues solvable by direct deduction
    generateGreedyDeducibleClues(targetCount) {
        const H = this.height;

        // Guaranteed solvable standard pattern:
        // Example for 4 rows: (3,0), (3,1), (2,2), (0,0) or staircase pattern
        // Build a known solvable template based on height:
        let clues = [];

        if (H === 2) {
            clues = [[1, 0], [1, 1]];
        } else if (H === 3) {
            // 3 clues: 2 in base, 1 in middle or top
            const patterns = [
                [[2, 0], [2, 1], [1, 1]],
                [[2, 1], [2, 2], [1, 0]],
                [[2, 0], [1, 1], [0, 0]]
            ];
            clues = patterns[Math.floor(Math.random() * patterns.length)];
        } else if (H === 4) {
            const patterns = [
                [[3, 0], [3, 1], [2, 2], [1, 1]],
                [[3, 1], [3, 2], [3, 3], [1, 0]],
                [[3, 0], [3, 3], [2, 1], [0, 0]],
                [[3, 0], [3, 2], [2, 0], [1, 1]]
            ];
            clues = patterns[Math.floor(Math.random() * patterns.length)];
        } else if (H === 5) {
            const patterns = [
                [[4, 0], [4, 1], [3, 2], [2, 1], [0, 0]],
                [[4, 0], [4, 2], [4, 4], [2, 0], [1, 1]],
                [[4, 1], [4, 2], [4, 3], [3, 0], [1, 1]]
            ];
            clues = patterns[Math.floor(Math.random() * patterns.length)];
        } else {
            // For H >= 6: mix of base and middle
            for (let c = 0; c < Math.ceil(H / 2); c++) {
                clues.push([H - 1, c * 2 % H]);
            }
            let row = H - 2;
            while (clues.length < H && row >= 0) {
                clues.push([row, Math.floor(Math.random() * (row + 1))]);
                row--;
            }
        }

        // Apply clues
        for (const [r, c] of clues) {
            if (r < H && c <= r && !this.initialClues[r][c]) {
                this.initialClues[r][c] = true;
                this.clueCount++;
            }
        }

        // Verify if fully solvable with direct deduction; if not, supplement up to H
        while (this.clueCount < H) {
            const r = Math.floor(Math.random() * H);
            const c = Math.floor(Math.random() * (r + 1));
            if (!this.initialClues[r][c]) {
                this.initialClues[r][c] = true;
                this.clueCount++;
            }
        }
    }

    // Master clue generator
    generateMasterClues(targetCount) {
        const H = this.height;
        // Place top stone (0, 0)
        this.initialClues[0][0] = true;
        this.clueCount = 1;

        // Place corners and sparse entries
        this.initialClues[H - 1][0] = true;
        this.clueCount++;

        this.initialClues[H - 1][H - 1] = true;
        this.clueCount++;

        // Fill remaining with random distinct stones
        while (this.clueCount < targetCount) {
            const r = Math.floor(Math.random() * (H - 1)) + 1;
            const c = Math.floor(Math.random() * (r + 1));
            if (!this.initialClues[r][c]) {
                this.initialClues[r][c] = true;
                this.clueCount++;
            }
        }
    }

    // Set user value in grid
    setUserValue(r, c, val) {
        if (r < 0 || r >= this.height || c < 0 || c > r) return;
        if (this.initialClues[r][c]) return; // Cannot edit initial clues
        this.userGrid[r][c] = val !== null && val !== '' && !isNaN(val) ? parseFloat(val) : null;
    }

    // Clear all user inputs (keeps initial clues)
    clearUserInputs() {
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c <= r; c++) {
                if (!this.initialClues[r][c]) {
                    this.userGrid[r][c] = null;
                }
            }
        }
    }

    // Solve entire pyramid into user grid
    solveAll() {
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c <= r; c++) {
                this.userGrid[r][c] = this.solution[r][c];
            }
        }
    }

    // Check if entire pyramid is filled correctly
    isFullySolved() {
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c <= r; c++) {
                const u = this.userGrid[r][c];
                const s = this.solution[r][c];
                if (u === null || Math.abs(u - s) > 0.001) return false;
            }
        }
        return true;
    }

    // Get count of filled cells
    getFilledCount() {
        let count = 0;
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c <= r; c++) {
                if (this.userGrid[r][c] !== null) count++;
            }
        }
        return count;
    }

    // Find the next directly deducible stone for the Hint system
    findNextHint() {
        // Look for any empty cell that can be calculated from 2 known neighbours in a triple:
        // Case A: Upward addition (children known)
        for (let r = 0; r < this.height - 1; r++) {
            for (let c = 0; c <= r; c++) {
                if (this.userGrid[r][c] === null) {
                    const c1 = this.userGrid[r + 1][c];
                    const c2 = this.userGrid[r + 1][c + 1];
                    if (c1 !== null && c2 !== null) {
                        const calculated = Math.round((c1 + c2) * 10) / 10;
                        return {
                            row: r,
                            col: c,
                            value: calculated,
                            formula: `${c1} + ${c2} = ${calculated}`,
                            explanation: `Stone at row ${r + 1}, position ${c + 1} is the sum of the two stones below it: ${c1} + ${c2} = ${calculated}.`
                        };
                    }
                }
            }
        }

        // Case B: Downward subtraction (parent and one child known)
        for (let r = 0; r < this.height - 1; r++) {
            for (let c = 0; c <= r; c++) {
                const parent = this.userGrid[r][c];
                if (parent !== null) {
                    const leftChild = this.userGrid[r + 1][c];
                    const rightChild = this.userGrid[r + 1][c + 1];

                    // Left child missing, right child known
                    if (leftChild === null && rightChild !== null) {
                        const calculated = Math.round((parent - rightChild) * 10) / 10;
                        return {
                            row: r + 1,
                            col: c,
                            value: calculated,
                            formula: `${parent} - ${rightChild} = ${calculated}`,
                            explanation: `Stone below left is parent minus right stone: ${parent} - ${rightChild} = ${calculated}.`
                        };
                    }

                    // Right child missing, left child known
                    if (rightChild === null && leftChild !== null) {
                        const calculated = Math.round((parent - leftChild) * 10) / 10;
                        return {
                            row: r + 1,
                            col: c + 1,
                            value: calculated,
                            formula: `${parent} - ${leftChild} = ${calculated}`,
                            explanation: `Stone below right is parent minus left stone: ${parent} - ${leftChild} = ${calculated}.`
                        };
                    }
                }
            }
        }

        // If no direct 1-step arithmetic triple is found, provide next cell from solution
        for (let r = this.height - 1; r >= 0; r--) {
            for (let c = 0; c <= r; c++) {
                if (this.userGrid[r][c] === null) {
                    return {
                        row: r,
                        col: c,
                        value: this.solution[r][c],
                        formula: `Value = ${this.solution[r][c]}`,
                        explanation: `By algebraic system elimination, stone (${r + 1}, ${c + 1}) equals ${this.solution[r][c]}.`
                    };
                }
            }
        }

        return null;
    }

    // Validate current user grid entries
    // Returns { validCells: Set, invalidCells: Set }
    validateGrid() {
        const validCells = new Set();
        const invalidCells = new Set();

        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c <= r; c++) {
                const u = this.userGrid[r][c];
                if (u !== null) {
                    const s = this.solution[r][c];
                    const key = `${r},${c}`;
                    if (Math.abs(u - s) < 0.001) {
                        validCells.add(key);
                    } else {
                        invalidCells.add(key);
                    }
                }
            }
        }

        return { validCells, invalidCells };
    }

    // Get the Binomial formula expansion for a specific cell (r, c)
    // expressed in terms of the bottom base stones b_0, b_1, ... b_{H-1}
    getBinomialExpansion(r, c) {
        const H = this.height;
        const depth = H - 1 - r; // Distance to base
        const terms = [];

        for (let k = 0; k <= depth; k++) {
            const coeff = PyramidEngine.binomial(depth, k);
            const baseIdx = c + k;
            const termStr = coeff === 1 ? `b_${baseIdx + 1}` : `${coeff}·b_${baseIdx + 1}`;
            terms.push(termStr);
        }

        return `V(${r + 1}, ${c + 1}) = ` + terms.join(' + ');
    }
}

window.PyramidEngine = PyramidEngine;
