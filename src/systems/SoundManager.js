export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Looping audio for brake
        this.brakeAudio = new Audio('assets/sound/breaks.mp3');
        this.brakeAudio.loop = true;
        this.brakeAudio.volume = 0.5;

        // Applause audio
        this.applauseAudio = new Audio('assets/sound/applause.mp3');

        // Looping audio for speed up
        this.speedUpAudio = new Audio('assets/sound/speed-up.mp3');
        this.speedUpAudio.loop = true;
        this.speedUpAudio.volume = 0.5;
    }

    startBrake() {
        if (this.brakeAudio.paused) {
            this.brakeAudio.currentTime = 0;
            this.brakeAudio.play().catch(e => { });
        }
    }

    stopBrake() {
        this.brakeAudio.pause();
        this.brakeAudio.currentTime = 0;
    }

    startSpeedUp() {
        if (this.speedUpAudio.paused) {
            this.speedUpAudio.currentTime = 0;
            this.speedUpAudio.play().catch(e => { });
        }
    }

    stopSpeedUp() {
        this.speedUpAudio.pause();
        this.speedUpAudio.currentTime = 0;
    }

    play(type) {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        let lastOut = 0; // For noise generation

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'shoot':
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'hit':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(55, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'clear':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554, now + 0.1); // C#
                osc.frequency.setValueAtTime(659, now + 0.2); // E
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;

            case 'gameOver':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(110, now);
                osc.frequency.linearRampToValueAtTime(55, now + 1.0);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 1.0);
                osc.start(now);
                osc.stop(now + 1.0);
                break;

            case 'metallic':
                // Light metallic ping
                // Use two oscillators for a bell-like tone if possible, but for simplicity here:
                // High frequency sine with rapid decay
                osc.type = 'sine';
                // Randomize pitch slightly to make it sound more organic/metallic
                const freq = 1500 + Math.random() * 500;
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.05, now); // Very quiet
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'applause':
                this.applauseAudio.currentTime = 0;
                this.applauseAudio.play().catch(e => { });
                break;
        }
    }
}
