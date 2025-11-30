import { ParticleSystem } from './systems/ParticleSystem.js';
import { Starfield } from './systems/Starfield.js';
import { SoundManager } from './systems/SoundManager.js';
import { Grid } from './systems/Grid.js';
import { Player } from './entities/Player.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.lastTime = 0;
        this.score = 0;
        this.level = 1;
        this.totalTime = 0;
        this.gameOver = false;

        this.bullets = [];
        this.particleSystem = new ParticleSystem();
        this.starfield = new Starfield(this.width, this.height);
        this.soundManager = new SoundManager();
        this.grid = new Grid(this);
        this.player = new Player(this);

        this.blockTexture = new Image();
        this.blockTexture.src = 'assets/images/block_texture.png';

        // Music Variations Configuration (will be loaded dynamically)
        this.musicVariations = {};

        this.introMusic = new Audio('assets/music/intro.ogg');
        this.introMusic.loop = true;
        this.introMusic.volume = 0.5;

        this.speedMultiplier = 1;
        this.gameState = 'START'; // START, PLAYING, GAMEOVER, ENTER_NAME
        this.nameEntered = false;

        // Black hole background element
        this.blackHoleImage = new Image();
        this.blackHoleImage.src = 'assets/images/blackhole.png';
        this.blackHole = null;
        this.blackHoleTimer = 0;
        this.blackHoleInterval = 40000; // Spawn every 40 seconds

        this.fadeInterval = null; // Track fade out interval

        // Level Transition Properties
        this.levelDuration = 100000; // 100 seconds per level
        this.transitionTextY = -100;
        this.transitionPhase = 0; // 0: Waiting for clear, 1: Text dropping

        this.init();
        this.bindEvents();
        this.loadHighScores();
        this.loadMusicConfig();
    }

    getApiBaseUrl() {
        // Detect if running locally or remotely
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '' ||
            window.location.protocol === 'file:';

        if (isLocal) {
            // Local development - use relative paths
            return '';
        } else {
            // Remote/production - use full URL
            return 'https://maggiore-sys.com.br/game';
        }
    }

    async loadMusicConfig() {
        try {
            const baseUrl = this.getApiBaseUrl();
            const url = baseUrl ? `${baseUrl}/get_music_files.php` : 'get_music_files.php';
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.files) {
                // Parse files to build variations map
                // Filename format: quarth_soundtrack_01a.ogg
                data.files.forEach(file => {
                    const match = file.match(/quarth_soundtrack_(\d+)([a-z])\.ogg/);
                    if (match) {
                        const level = parseInt(match[1], 10);
                        const variation = match[2];

                        if (!this.musicVariations[level]) {
                            this.musicVariations[level] = [];
                        }
                        this.musicVariations[level].push(variation);
                    }
                });
                console.log("Music configuration loaded:", this.musicVariations);

                // Initialize music after loading config
                const initialMusicSrc = this.getRandomMusicSrc(1);
                this.music = new Audio(initialMusicSrc);
                this.music.loop = true;
                this.music.volume = 0.5;
            }
        } catch (error) {
            console.error("Failed to load music config:", error);
            // Fallback defaults if PHP fails - always use variation 'a'
            this.musicVariations = {};
            for (let i = 1; i <= 10; i++) {
                this.musicVariations[i] = ['a'];
            }

            // Initialize music using the same method as successful load
            const initialMusicSrc = this.getRandomMusicSrc(this.level);
            this.music = new Audio(initialMusicSrc);
            this.music.loop = true;
            this.music.volume = 0.5;
        }
    }

    getRandomMusicSrc(level) {
        const variations = this.musicVariations[level] || ['a'];
        const variation = variations[Math.floor(Math.random() * variations.length)];
        const levelStr = level.toString().padStart(2, '0');
        return `assets/music/quarth_soundtrack_${levelStr}${variation}.ogg`;
    }

    init() {
        console.log("Game Initialized");

        // Try to play intro music
        this.introMusic.play().catch(e => {
            // console.log("Intro music waiting for interaction");
        });

        // Don't start loop yet, just draw initial frame or wait
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    startGame() {
        if (this.gameState === 'PLAYING') return;

        this.gameState = 'PLAYING';
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('ui-layer').classList.remove('hidden');

        // Stop intro music
        this.introMusic.pause();
        this.introMusic.currentTime = 0;

        this.ensureMusicPlaying();
    }

    ensureMusicPlaying() {
        if (this.gameState === 'START') {
            if (this.introMusic.paused) {
                this.introMusic.play().catch(e => { });
            }
        } else if (this.gameState === 'PLAYING') {
            if (this.music.paused) {
                this.music.play().catch(e => { });
            }
        }
    }

    bindEvents() {
        // Handle name input submission
        const nameInput = document.getElementById('player-name');
        const submitBtn = document.getElementById('submit-name-btn');

        // Enter key handler
        nameInput.addEventListener('keydown', (e) => {
            if (e.code === 'Enter') {
                e.preventDefault();
                this.submitName();
            }
        });

        // Click/touch handler for button
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitName();
        });
        submitBtn.addEventListener('touchstart', (e) => {
            e.stopPropagation(); // Stop it from bubbling to window
            // e.preventDefault(); // Don't prevent default here, let click happen or handle logic
            this.submitName();
        }, { passive: false });

        // WhatsApp share button
        const shareBtn = document.getElementById('share-btn');
        shareBtn.addEventListener('click', () => {
            this.shareScore();
        });

        // Force uppercase input
        nameInput.addEventListener('input', (e) => {
            nameInput.value = nameInput.value.toUpperCase();
        });

        window.addEventListener('keydown', (e) => {
            if (this.gameState === 'START') {
                this.startGame();
                return;
            }

            // Ignore game controls when entering name
            if (this.gameState === 'ENTER_NAME') {
                return;
            }

            this.ensureMusicPlaying();

            // Allow ANY key to reset from GAMEOVER screen
            if (this.gameState === 'GAMEOVER') {
                this.reset();
                return;
            }

            switch (e.code) {
                case 'ArrowLeft':
                    this.player.movingLeft = true;
                    break;
                case 'ArrowRight':
                    this.player.movingRight = true;
                    break;
                case 'ArrowUp':
                    this.speedMultiplier = 5.0; // Fast forward
                    break;
                case 'ArrowDown':
                    this.speedMultiplier = 0.5; // Slow motion
                    break;
                case 'Space':
                    if (!this.gameOver) this.player.shoot();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                    this.player.movingLeft = false;
                    break;
                case 'ArrowRight':
                    this.player.movingRight = false;
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    this.speedMultiplier = 1.0; // Reset speed
                    break;
            }
        });

        // Attach to window to catch touches everywhere
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
        window.addEventListener('touchend', this.handleTouch.bind(this), { passive: false });
        window.addEventListener('touchcancel', this.handleTouch.bind(this), { passive: false });
    }

    submitName() {
        if (this.gameState === 'ENTER_NAME') {
            const nameInput = document.getElementById('player-name');
            const name = nameInput.value.trim().toUpperCase() || 'PLAYER';
            this.saveHighScore(name, this.score);
        }
    }

    handleTouch(e) {
        // Allow default behavior for buttons and inputs
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
            return;
        }

        e.preventDefault(); // Prevent scrolling/zooming
        this.ensureMusicPlaying();

        // Reset movement flags
        this.player.movingLeft = false;
        this.player.movingRight = false;

        const touches = e.touches;
        const width = window.innerWidth;

        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const x = touch.clientX;
            const relativeX = x / width;

            if (relativeX < 0.15) {
                this.player.movingLeft = true;
            } else if (relativeX > 0.85) {
                this.player.movingRight = true;
            }
        }
    }

    handleTouchStart(e) {
        if (this.gameState === 'START') {
            this.startGame();
            return;
        }

        // Allow touch to reset from GAMEOVER screen - check this BEFORE button check
        // This allows tapping anywhere (even on the game-over overlay) to restart
        if (this.gameState === 'GAMEOVER') {
            // Only prevent reset if touching the WhatsApp share button specifically
            if (e.target.id === 'share-btn' || e.target.closest('#share-btn')) {
                return; // Let the button handle its own click
            }
            this.reset();
            return;
        }

        // Allow default behavior for buttons and inputs ONLY during gameplay
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
            return;
        }

        this.handleTouch(e);

        // Handle shooting separately on start to avoid rapid fire on hold if we don't want it, 
        // or just to detect the "tap" in the center.
        const touches = e.changedTouches; // Only new touches
        const width = window.innerWidth;

        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const x = touch.clientX;
            const relativeX = x / width;

            if (relativeX >= 0.15 && relativeX <= 0.85) {
                if (!this.gameOver) this.player.shoot();
            }
        }
    }


    reset() {
        this.gameOver = false;
        this.gameState = 'START';
        this.score = 0;
        this.level = 1;
        this.totalTime = 0;
        this.bullets = [];
        this.particleSystem = new ParticleSystem();
        this.grid = new Grid(this);
        this.player.x = this.width / 2 - this.player.width / 2;

        // Reset Black Hole
        this.blackHoleTimer = 0;
        this.blackHole = null;

        // Hide game over, show start screen
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('ui-layer').classList.add('hidden');

        // Reset UI
        document.getElementById('score').innerText = 'Score: 0';
        document.getElementById('level').innerText = 'Level: 1';

        // Pause music
        this.music.pause();
        this.music.currentTime = 0;

        // Play intro music
        this.introMusic.currentTime = 0;
        this.introMusic.play().catch(e => { });

        // Reset music to Level 1
        this.changeMusic(1);
    }

    setGameOver() {
        this.gameOver = true;
        this.gameState = 'ENTER_NAME';
        this.nameEntered = false;
        this.soundManager.play('gameOver');
        this.music.pause();

        // Show final score
        document.getElementById('final-score').innerText = `Score: ${this.score}`;

        // Show name entry, hide restart message and share button
        document.getElementById('name-entry').classList.remove('hidden');
        document.getElementById('restart-msg').classList.add('hidden');
        document.getElementById('share-btn').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');

        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('player-name');
            input.value = '';
            input.focus();
        }, 100);
    }

    update(deltaTime) {
        if (this.gameState === 'START') {
            this.starfield.update(0.5); // Move stars slowly in background
            return;
        }

        if (this.gameOver || this.gameState === 'ENTER_NAME') return;

        // Update total time only if playing (not in transition)
        if (this.gameState === 'PLAYING') {
            this.totalTime += deltaTime;

            // Check for level progression
            if (this.totalTime > this.level * this.levelDuration) {
                this.startLevelTransition();
            }
        } else if (this.gameState === 'LEVEL_TRANSITION') {
            this.updateLevelTransition(deltaTime);
        }

        this.player.update(deltaTime);
        this.starfield.update(this.speedMultiplier);
        this.updateBlackHole(deltaTime);
        this.grid.update(deltaTime);
        this.particleSystem.update();

        // Update bullets
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        this.bullets = this.bullets.filter(bullet => bullet.active);
    }

    startLevelTransition() {
        this.gameState = 'LEVEL_TRANSITION';
        this.transitionPhase = 0; // Waiting for clear
        this.transitionTextY = -100;
        console.log("Starting Level Transition");
    }

    updateLevelTransition(deltaTime) {
        // Phase 0: Wait for screen to clear (no active shapes)
        if (this.transitionPhase === 0) {
            // Grid spawning is disabled in Grid.update when gameState is LEVEL_TRANSITION
            if (this.grid.shapes.length === 0) {
                this.transitionPhase = 1; // Start text animation
                this.soundManager.play('clear'); // Sound effect for clear
            }
        }
        // Phase 1: Text dropping
        else if (this.transitionPhase === 1) {
            this.transitionTextY += 200 * (deltaTime / 1000); // Speed of text drop

            if (this.transitionTextY > this.height + 50) {
                // Text finished dropping
                this.level++;
                document.getElementById('level').innerText = `Level: ${this.level}`;
                this.gameState = 'PLAYING';
                this.transitionTextY = -100;

                // Change music for new level
                this.changeMusic(this.level);
            }
        }
    }

    changeMusic(level) {
        const newMusicSrc = this.getRandomMusicSrc(level);

        // Create a new audio object to test if the file exists
        const tempAudio = new Audio(newMusicSrc);
        tempAudio.loop = true;
        tempAudio.volume = 0.5;

        // Try to load the metadata
        tempAudio.addEventListener('loadedmetadata', () => {
            // File exists and loaded successfully
            console.log(`Changing music to ${newMusicSrc}`);

            // Clear any existing fade interval
            if (this.fadeInterval) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }

            const oldMusic = this.music;

            // If old music is not playing or volume is already 0, switch immediately
            if (oldMusic.paused || oldMusic.volume <= 0) {
                this.music = tempAudio;
                this.ensureMusicPlaying();
                return;
            }

            // Fade out old music over 1.5 seconds
            const fadeDuration = 1500;
            const steps = 15;
            const stepTime = fadeDuration / steps;
            const volStep = oldMusic.volume / steps;

            this.fadeInterval = setInterval(() => {
                if (oldMusic.volume > volStep) {
                    oldMusic.volume -= volStep;
                } else {
                    // Fade complete
                    oldMusic.volume = 0;
                    clearInterval(this.fadeInterval);
                    this.fadeInterval = null;

                    oldMusic.pause();
                    oldMusic.volume = 0.5; // Reset volume for future use if cached

                    // Start new music
                    this.music = tempAudio;
                    this.music.volume = 0.5;
                    this.ensureMusicPlaying();
                }
            }, stepTime);
        });

        tempAudio.addEventListener('error', (e) => {
            console.log(`Music file ${newMusicSrc} not found or failed to load. Keeping current track.`);
            // Do nothing, current music continues playing
        });

        // Trigger load
        tempAudio.load();
    }

    updateBlackHole(deltaTime) {
        // Spawn black hole periodically
        this.blackHoleTimer += deltaTime;
        if (this.blackHoleTimer > this.blackHoleInterval && !this.blackHole) {
            this.blackHole = {
                x: Math.random() * (this.width - 150) + 75, // Random x position
                y: -200, // Start above screen
                speed: 0.3, // Very slow (much slower than pieces)
                rotation: 0,
                rotationSpeed: 0.001 // Slow rotation for atmosphere
            };
            this.blackHoleTimer = 0;
        }

        // Update black hole position
        if (this.blackHole) {
            this.blackHole.y += this.blackHole.speed;
            this.blackHole.rotation += this.blackHole.rotationSpeed;

            // Remove when off screen
            if (this.blackHole.y > this.height + 200) {
                this.blackHole = null;
            }
        }
    }

    draw() {
        // Clear screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw black hole (behind everything)
        if (this.blackHole && this.blackHoleImage.complete) {
            this.ctx.save();
            this.ctx.translate(this.blackHole.x, this.blackHole.y);
            this.ctx.rotate(this.blackHole.rotation);
            this.ctx.globalAlpha = 0.7; // Slightly transparent
            this.ctx.drawImage(this.blackHoleImage, -75, -75, 150, 150);
            this.ctx.restore();
        }

        this.starfield.draw(this.ctx);

        if (this.gameState === 'START') return;

        this.grid.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
        this.player.draw(this.ctx);
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw Level Transition Text
        if (this.gameState === 'LEVEL_TRANSITION' && this.transitionPhase === 1) {
            this.ctx.save();
            this.ctx.font = '60px "Courier New", monospace'; // "Grande e fina"
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 20;
            this.ctx.fillText(`LEVEL ${this.level + 1}`, this.width / 2, this.transitionTextY);
            this.ctx.restore();
        }
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    async loadHighScores() {
        try {
            const baseUrl = this.getApiBaseUrl();
            const url = baseUrl ? `${baseUrl}/scores.php?action=getTopScores` : 'scores.php?action=getTopScores';
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.scores) {
                const scoresContainer = document.querySelector('.high-scores');
                const entries = scoresContainer.querySelectorAll('.score-entry');

                // Update each entry
                for (let i = 0; i < 10; i++) {
                    if (data.scores[i]) {
                        const spans = entries[i].querySelectorAll('span');
                        spans[0].textContent = data.scores[i].name;
                        spans[1].textContent = data.scores[i].score;
                    } else {
                        // Show default/empty entry
                        const spans = entries[i].querySelectorAll('span');
                        spans[0].textContent = '---';
                        spans[1].textContent = '0';
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load high scores:', error);
        }
    }

    async saveHighScore(name, score) {
        try {
            const baseUrl = this.getApiBaseUrl();
            const url = baseUrl ? `${baseUrl}/scores.php?action=saveScore` : 'scores.php?action=saveScore';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, score })
            });

            const data = await response.json();

            if (data.success) {
                // Reload high scores
                await this.loadHighScores();

                // Switch to restart mode
                this.gameState = 'GAMEOVER';
                this.nameEntered = true;
                this.savedPlayerName = name; // Save for share message
                this.savedScore = score;
                document.getElementById('name-entry').classList.add('hidden');
                document.getElementById('restart-msg').classList.remove('hidden');
                document.getElementById('share-btn').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Failed to save high score:', error);
            // Still allow restart even if save failed
            this.gameState = 'GAMEOVER';
            this.nameEntered = true;
            document.getElementById('name-entry').classList.add('hidden');
            document.getElementById('restart-msg').classList.remove('hidden');
            document.getElementById('share-btn').classList.remove('hidden');
        }
    }

    shareScore() {
        const playerName = this.savedPlayerName || 'Jogador';
        const score = this.savedScore || this.score;

        // Create WhatsApp message
        const message = `*MOSCÃO FIGHTER* \n\n` +
            `Acabei de fazer ${score} pontos como ${playerName}! \n\n` +
            `Consegue me bater? \n\n` +
            `Jogue agora: https://maggiore-sys.com.br/game/`;

        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);

        // Open WhatsApp with the message
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }
}
