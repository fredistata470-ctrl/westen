// Audio Manager — centralized audio system.
// Voice lines and SFX all route through here so dialogue and engine
// do NOT embed audio logic directly.

const audioManager = {
    _cache: {},
    _ctx: null,
    // Volume level for crowd reactions: 1.0 = home goal, 0.6 = away goal
    crowdVolume: 1.0,
    // Ambient chant oscillator node (held for looping chant)
    _chantNode: null,
    _chantGain: null,
    // Main menu theme (looping background music)
    _menuAudio: null,

    _getAudioContext() {
        if (!this._ctx) {
            try {
                this._ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (_e) {
                return null;
            }
        }
        return this._ctx;
    },

    // Play a voice-over file by path (e.g. "assets/audio/coach_line1.mp3").
    // Silently skips if src is falsy or the file is unavailable.
    playVoice(src) {
        if (!src) return;
        try {
            if (!this._cache[src]) {
                this._cache[src] = new Audio(src);
            }
            const audio = this._cache[src];
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Autoplay blocked or file missing — skip silently
            });
        } catch (_e) {
            // Audio API unavailable
        }
    },

    // Play a named sound effect using Web Audio API tones as placeholders.
    // type: "goal_cheer" | "goal_boo" | "crowd_ooh" | "crowd_ah" | "crowd_chant"
    // volume: optional 0–1 multiplier (defaults to crowdVolume for crowd sounds)
    // When real audio assets are added, replace _playTone calls with Audio file playback.
    playSFX(type, volume) {
        const ac = this._getAudioContext();
        if (!ac) return;
        const vol = (volume !== undefined) ? volume : this.crowdVolume;
        try {
            if (type === "goal_cheer") {
                // Big home cheer — rising chord burst, scaled by crowdVolume
                this._playTone(ac, 440, 0.22, 0.0,  "sine",   vol * 0.18);
                this._playTone(ac, 554, 0.22, 0.10, "sine",   vol * 0.18);
                this._playTone(ac, 659, 0.28, 0.20, "sine",   vol * 0.20);
                this._playTone(ac, 880, 0.20, 0.32, "sine",   vol * 0.15);
            } else if (type === "goal_boo") {
                // Away goal boo — descending moan
                this._playTone(ac, 280, 0.30, 0.0,  "sawtooth", vol * 0.10);
                this._playTone(ac, 220, 0.30, 0.15, "sawtooth", vol * 0.10);
                this._playTone(ac, 180, 0.25, 0.30, "sawtooth", vol * 0.08);
            } else if (type === "crowd_ooh") {
                // Low crowd murmur on near miss
                this._playTone(ac, 220, 0.08, 0.0,  "sine", vol * 0.12);
                this._playTone(ac, 260, 0.08, 0.10, "sine", vol * 0.12);
            } else if (type === "crowd_ah") {
                // Rising crowd exclamation
                this._playTone(ac, 300, 0.09, 0.0,  "sine", vol * 0.13);
                this._playTone(ac, 360, 0.09, 0.12, "sine", vol * 0.13);
            } else if (type === "crowd_chant") {
                // Short rhythmic chant pulse (home team momentum)
                this._playTone(ac, 200, 0.12, 0.0,  "square", vol * 0.08);
                this._playTone(ac, 200, 0.12, 0.25, "square", vol * 0.08);
                this._playTone(ac, 240, 0.14, 0.50, "square", vol * 0.09);
            }
        } catch (_e) {
            // Audio API unavailable or blocked
        }
    },

    // Start a looping ambient stadium hum. Call once per match.
    startAmbient() {
        const ac = this._getAudioContext();
        if (!ac || this._chantNode) return;
        try {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = "sine";
            osc.frequency.value = 110;
            gain.gain.value = 0.04;
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start();
            this._chantNode = osc;
            this._chantGain = gain;
        } catch (_e) { /* ignore */ }
    },

    // Update ambient volume based on current momentum level (0–1).
    setAmbientIntensity(level) {
        if (!this._chantGain) return;
        try {
            const ac = this._getAudioContext();
            if (!ac) return;
            const target = 0.03 + level * 0.07;
            this._chantGain.gain.setTargetAtTime(target, ac.currentTime, 0.5);
        } catch (_e) { /* ignore */ }
    },

    // Stop the ambient loop (call when match ends).
    stopAmbient() {
        if (!this._chantNode) return;
        try {
            this._chantNode.stop();
        } catch (_e) { /* ignore */ }
        this._chantNode = null;
        this._chantGain = null;
    },

    // Internal helper: schedule a short tone burst via Web Audio API.
    _playTone(ac, freq, duration, delaySeconds, oscType, gainLevel) {
        try {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = oscType || "sine";
            osc.frequency.value = freq;
            const g = gainLevel !== undefined ? gainLevel : 0.15;
            gain.gain.setValueAtTime(g, ac.currentTime + delaySeconds);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delaySeconds + duration);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(ac.currentTime + delaySeconds);
            osc.stop(ac.currentTime + delaySeconds + duration + 0.05);
        } catch (_e) { /* ignore */ }
    },

    // Start looping main menu background theme. Call when entering the main menu.
    // src: file path to the audio asset; silently skips if src is falsy (placeholder).
    playMenuTheme(src) {
        this.stopMenuTheme();
        if (!src) return;
        try {
            if (!this._cache[src]) {
                this._cache[src] = new Audio(src);
                this._cache[src].loop = true;
            }
            this._menuAudio = this._cache[src];
            this._menuAudio.currentTime = 0;
            this._menuAudio.play().catch(() => {
                // Autoplay blocked or file missing — skip silently
            });
        } catch (_e) {
            // Audio API unavailable
        }
    },

    // Stop the main menu theme immediately. Call when leaving the main menu.
    stopMenuTheme() {
        if (!this._menuAudio) return;
        try {
            this._menuAudio.pause();
            this._menuAudio.currentTime = 0;
        } catch (_e) { /* ignore */ }
        this._menuAudio = null;
    },

    stop(src) {
        if (!src || !this._cache[src]) return;
        try {
            this._cache[src].pause();
            this._cache[src].currentTime = 0;
        } catch (_e) { /* ignore */ }
    }
};
