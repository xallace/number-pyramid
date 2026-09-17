/* ==========================================================================
   Web Audio API Procedural Sound Synthesizer for Number Pyramid
   Zero external asset dependencies - 100% lightweight procedural audio
   ========================================================================== */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initOnFirstUserGesture();
    }

    initOnFirstUserGesture() {
        const unlock = () => {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx && this.enabled;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Soft stone click when focusing or typing a number into a brick
    playClick() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // Crisp affirmative chime when a brick is correctly calculated
    playCorrect() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.06); // A5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    // Gentle error buzz on conflicting calculation
    playError() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.15);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Harmonic arpeggiated triumph chime when completing the entire pyramid!
    playVictory() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;
        // Pentatonic victory chord: C5, E5, G5, A5, C6
        const notes = [523.25, 659.25, 783.99, 880.00, 1046.50];

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            const startT = now + idx * 0.08;
            const endT = startT + 0.55;

            gain.gain.setValueAtTime(0.001, startT);
            gain.gain.linearRampToValueAtTime(0.14, startT + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, endT);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startT);
            osc.stop(endT);
        });
    }

    // Hint reveal sound
    playHint() {
        if (!this.ensureContext()) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }
}

window.soundEngine = new SoundEngine();
