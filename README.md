<div align="center">

# 🔺 3D Zahlenpyramide · Number Pyramid
### Interactive 3D Arithmetic Wall, Constraint Propagation & Step-by-Step Walkthrough

[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00f2fe?style=for-the-badge&logo=github)](https://xallace.github.io/number-pyramid/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Platform: Web](https://img.shields.io/badge/Platform-3D_CSS_Canvas-3b82f6?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style)
[![Vanilla JS](https://img.shields.io/badge/Dependencies-Zero_Vanilla_ES6-f59e0b?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bilingual](https://img.shields.io/badge/Language-DE_%7C_EN-8b5cf6?style=for-the-badge)](#features)

*A 3D isometric modernization and pedagogical tribute to Walter Fendt’s classic mathematics applet (1997–2023).*

[**🚀 Launch Live 3D Simulation**](https://xallace.github.io/number-pyramid/) • [**📐 Core Mechanics**](#core-mathematics--mechanics) • [**✨ Features**](#features--interactive-controls) • [**🛠️ Local Setup**](#local-setup)

</div>

---

## 🌟 Overview

A **Number Pyramid** (*Zahlenpyramide* / *Rechenmauer*) is a foundational mathematical puzzle where each stone is the sum of the two stones directly beneath it:

$$C = A + B$$

Conversely, knowing a parent stone and one child immediately yields the adjacent child via subtraction:

$$A = C - B \quad \text{and} \quad B = C - A$$

This project transforms Walter Fendt's classic 1997/2023 educational applet into a **3D isometric interactive tactile workspace**. Featuring interactive perspective rotation, direct on-brick keyboard input, constraint propagation solvers, an automated animated solution walkthrough, procedural sound effects, and confetti physics celebrations.

---

## ✨ Features & Interactive Controls

| Feature | Description |
| :--- | :--- |
| **🎮 Interactive 3D Stage** | True 3D isometric perspective view with interactive mouse & touch drag rotation (`rotateX`, `rotateY`). Double-click to reset angle; toggleable 2D/3D flat mode. |
| **⌨️ Fluid On-Brick Typing** | Click any empty brick and type directly. Use arrow keys ($\leftarrow, \rightarrow, \uparrow, \downarrow$) to navigate adjacent stones, `Enter` to check, or `?` to request a hint. |
| **🧩 Automated Walkthrough Solver** | Click **"Lösungsweg"** (Walkthrough) to watch an automated step-by-step visual deduction solve the pyramid with animated source stone pulses. |
| **💡 Step-by-Step Hint Engine** | Analyzes the current pyramid state and calculates the next immediately solvable stone, displaying the exact arithmetic formula ($C = A + B$ or $A = C - B$). |
| **🏗️ Free Build (Sandbox Mode)** | Switch to **"Freier Bau"** (Free Build): type any numbers anywhere—the solver automatically propagates all deducible stones and highlights contradictions in real time. |
| **🎉 Victory Celebration** | Custom HTML5 Canvas 2D confetti particle explosion with celebratory audio fanfare when the pyramid is successfully solved. |
| **🔊 Procedural Web Audio API** | Zero external audio files: procedural sound synthesis for brick taps, affirmative chords, error buzzes, and victory arpeggios. |
| **🎛️ Fully Parametric** | Choose between 2 to 8 rows (3 to 36 stones), Natural ($\mathbb{N}$) vs Integer ($\mathbb{Z}$) domains, and Easy / Medium / Hard difficulty tiers. |
| **🎨 High-Contrast Typography** | Beautifully styled with Atkinson Hyperlegible, Martian Mono, and Bricolage Grotesque fonts with dark/light theme support. |
| **🌐 Bilingual (DE & EN)** | Instant language toggle between German and English. |

---

## 📐 Core Mathematics & Mechanics

### 1. Constraint Propagation Algorithm
The solver utilizes a greedy propagation loop:
1. Scan all vertical stone triples $(P, A, B)$ where $P$ is the parent and $A, B$ are the left/right children.
2. If $P$ is unknown while $A$ and $B$ are known:
   $$P \leftarrow A + B$$
3. If $A$ is unknown while $P$ and $B$ are known:
   $$A \leftarrow P - B$$
4. If $B$ is unknown while $P$ and $A$ are known:
   $$B \leftarrow P - A$$
5. Repeat until the entire grid is resolved or no single-step linear deductions remain.

### 2. Combinatorics & Binomial Theorem
If the base row contains values $b_0, b_1, \dots, b_{n}$, then any stone $V(r, c)$ is an explicit linear combination weighted by the binomial coefficients $\binom{n}{k}$ from **Pascal's Triangle**:

$$V(r, c) = \sum_{k=0}^{H - 1 - r} \binom{H - 1 - r}{k} b_{c + k}$$

---

## 🛠️ Local Setup & Quick Start

Because this application is built with standard Web APIs, it runs out of the box with zero dependencies and no build steps:

### Option 1: Direct File
Double-click `index.html` in your web browser.

### Option 2: Local Python Server
```bash
# Clone the repository
git clone https://github.com/xallace/number-pyramid.git
cd number-pyramid

# Start a local preview server
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🌐 Deploying to GitHub Pages

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/xallace/number-pyramid.git
   git branch -M main
   git push -u origin main
   ```
2. Navigate to **Settings** → **Pages** on your GitHub repository.
3. Under **Branch**, select `main` and root `/`, then save.
4. Your application will be live at:
   ```
   https://xallace.github.io/number-pyramid/
   ```

---

## 📜 Credits & License

* **Original Concept**: [Walter Fendt's HTML5 Zahlenpyramide](https://www.walter-fendt.de/html5/mde/numberpyramid_de.htm) (1997–2023).
* **3D Architecture & Implementation**: [Claude.ai](https://claude.ai) & [Walter Lehn (xallace)](https://github.com/xallace).
* **License**: [MIT License](LICENSE).
