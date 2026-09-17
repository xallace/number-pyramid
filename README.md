<div align="center">

# 🔺 Number Pyramid & Pascal Laboratory
### Interactive Additive Arithmetic, Algebraic Deduction & Binomial Combinatorics

[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00f2fe?style=for-the-badge&logo=github)](https://xallace.github.io/number-pyramid/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Platform: Web](https://img.shields.io/badge/Platform-Web_DOM_Bricks-3b82f6?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Vanilla JS](https://img.shields.io/badge/Dependencies-Zero_Vanilla_ES6-f59e0b?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bilingual](https://img.shields.io/badge/Language-DE_%7C_EN-8b5cf6?style=for-the-badge)](#features)

*A responsive modernization and pedagogical tribute to Walter Fendt’s classic mathematics applet (1997–2023).*

[**🚀 Launch Live Laboratory**](https://xallace.github.io/number-pyramid/) • [**📐 Mathematical Foundations**](#mathematical-foundations) • [**✨ Modern Enhancements**](#features-modern-enhancements) • [**🛠️ Local Setup**](#local-setup)

</div>

---

## 🌟 Overview

A **Number Pyramid** (also known as an *Addition Wall* or *Zahlenmauer*) is an elegant mathematical structure where every stone equals the sum of the two stones supporting it directly below:

$$C = A + B$$

Conversely, knowing a parent stone and one child yields the adjacent child via subtraction ($A = C - B$ or $B = C - A$).

While Walter Fendt's original HTML5 applet required clicking a cell, tabbing into an external sidebar input, and clicking an "Übernehmen" button, this modernized simulator transforms the experience into a fluid, tactile arithmetic workstation with direct on-brick typing, arrow-key navigation, procedural Web Audio effects, step-by-step deductive hint explanations, and an explicit **Pascal's Triangle Binomial Expansion** mode.

---

## ✨ Features & Modern Enhancements

| Feature | Original App (*Walter Fendt*) | Modernized Laboratory (2026) |
| :--- | :--- | :--- |
| **Interaction** | Separate sidebar input field + "Übernehmen" button | **Direct on-brick inline typing**, auto-tabbing, and 4-way arrow key navigation |
| **Mobile & Touch** | Limited desktop form layout | Fully responsive layout with optional **Virtual On-Screen Numpad** |
| **Hint System** | "Lösung zeigen" (all or nothing) | **Step-by-step arithmetic deduction engine** highlighting solvable triples with exact formulas |
| **Combinatorics Connection** | Pure arithmetic addition | **Binomial expansion overlay** revealing the Pascal Triangle coefficients ($\binom{n}{k}$) |
| **Validation** | Manual submit | **Real-time live validation** with gentle green glow or red error feedback |
| **Sound & Haptics** | Silent | **Procedural Web Audio API synthesizer** (stone click, valid chord, victory fanfare) |
| **Heights & Difficulty** | Flat selection | 2 to 8 rows (3 to 36 stones) across **Novice**, **Intermediate**, and **Master** tiers |
| **Number Domains** | Natural ($\mathbb{N}_0$) and Integers ($\mathbb{Z}$) | Natural ($\mathbb{N}_0$), Integers ($\mathbb{Z} \pm$), and Decimals ($0.5$ step) |
| **Themes & I18N** | Fixed grey table (German only) | **Midnight Slate Glassmorphism** & Academic Light theme; **DE / EN** toggle |
| **Dependencies** | None | **Zero Dependencies** (Pure Vanilla ES6 HTML5/CSS3 – runs anywhere) |

---

## 📐 Mathematical Foundations

### 1. The Fundamental Recursive Addition Rule
For a pyramid of height $H$, let $V(r, c)$ denote the value of the stone at row $r$ ($0 \le r < H$, where $r = 0$ is the apex) and column $c$ ($0 \le c \le r$):

$$V(r, c) = V(r + 1, c) + V(r + 1, c + 1)$$

### 2. The Pascal Triangle & Binomial Expansion Theorem
A profound bridge connects elementary arithmetic in number pyramids directly to **algebraic combinatorics**. Any stone $V(r, c)$ can be expressed as an explicit linear combination of the bottom base row stones $b_0, b_1, \dots, b_{H-1}$:

$$V(r, c) = \sum_{k=0}^{H - 1 - r} \binom{H - 1 - r}{k} b_{c + k}$$

where $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ is the binomial coefficient.

#### Example: 4-Row Pyramid Apex
In a 4-row pyramid ($H = 4$), the distance from apex ($r = 0$) to the base is $d = 3$. The top stone $T = V(0, 0)$ is:

$$T = \binom{3}{0} b_0 + \binom{3}{1} b_1 + \binom{3}{2} b_2 + \binom{3}{3} b_3 = 1\cdot b_0 + 3\cdot b_1 + 3\cdot b_2 + 1\cdot b_3$$

Notice that the weighting coefficients $(1, 3, 3, 1)$ are precisely the 3rd row of **Pascal's Triangle**!

---

## 🎮 How to Play & Navigate

* **Typing on Bricks**: Click any empty stone and type a number directly.
* **Navigation**:
  * `Enter`: Confirms input and automatically jumps to the next empty stone.
  * `Arrow Keys` ($\leftarrow, \rightarrow, \uparrow, \downarrow$): Moves focus across adjacent bricks.
  * `Backspace`: Deletes digit or clears stone.
* **Step-by-Step Hint** (`💡 Tipp / Hint`): Analyzes the current grid and reveals the next immediately deducible stone with its complete formula (e.g. $42 - 19 = 23$).
* **Pascal View** (`📐 Pascal-Ansicht`): Toggles the binomial expansion formulas directly on each brick!
* **Virtual Numpad** (`🔢 Ziffernblock`): Handy on-screen keypad for touchscreens and tablets.

---

## 🛠️ Local Setup & Quick Start

Because this laboratory is built with standard Web APIs, it requires no compilers, no node_modules, and zero build configuration:

### Option 1: Direct File
Double-click `index.html` in your web browser.

### Option 2: Local Python Server
```bash
# Clone the repository
git clone https://github.com/xallace/number-pyramid.git
cd number-pyramid

# Start local preview server
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🌐 Deploying to GitHub Pages

1. Create a new empty repository named `number-pyramid` on GitHub:
   ```bash
   git remote add origin https://github.com/xallace/number-pyramid.git
   git branch -M main
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** → **Pages**.
3. Under **Branch**, choose `main` and root `/`, then save.
4. Your application is live at:
   ```
   https://xallace.github.io/number-pyramid/
   ```

---

## 📜 Credits & License

* **Original Concept**: [Walter Fendt's HTML5 Zahlenpyramide](https://www.walter-fendt.de/html5/mde/numberpyramid_de.htm) (First released Nov 1, 1997; updated Feb 5, 2023).
* **Modern Architecture & Combinatorial Engine**: [Walter Lehn (xallace)](https://github.com/xallace).
* **License**: [MIT License](LICENSE).
