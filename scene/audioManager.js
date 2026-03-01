// Audio Manager — centralized audio system.
// Voice lines and SFX all route through here so dialogue and engine
// do NOT embed audio logic directly.

const audioManager = {
    _cache: {},
    _ctx: null,

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
    // type: "goal_cheer" | "crowd_ooh" | "crowd_ah"
    // When real audio assets are added, replace _playTone calls with Audio file playback.
    playSFX(type) {
        const ac = this._getAudioContext();
        if (!ac) return;
        try {
            if (type === "goal_cheer") {
                // Rising cheerful tone burst
                this._playTone(ac, 440, 0.18, 0.0, "sine");
                this._playTone(ac, 554, 0.18, 0.12, "sine");
                this._playTone(ac, 659, 0.22, 0.24, "sine");
            } else if (type === "crowd_ooh") {
                // Low crowd murmur
                this._playTone(ac, 220, 0.08, 0.0, "sine");
                this._playTone(ac, 260, 0.08, 0.10, "sine");
            } else if (type === "crowd_ah") {
                // Rising crowd exclamation
                this._playTone(ac, 300, 0.09, 0.0, "sine");
                this._playTone(ac, 360, 0.09, 0.12, "sine");
            }
        } catch (_e) {
            // Audio API unavailable or blocked
        }
    },

    // Internal helper: schedule a short tone burst via Web Audio API.
    _playTone(ac, freq, duration, delaySeconds, type) {
        try {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = type || "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, ac.currentTime + delaySeconds);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delaySeconds + duration);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(ac.currentTime + delaySeconds);
            osc.stop(ac.currentTime + delaySeconds + duration + 0.05);
        } catch (_e) { /* ignore */ }
    },

    stop(src) {
        if (!src || !this._cache[src]) return;
        try {
            this._cache[src].pause();
            this._cache[src].currentTime = 0;
        } catch (_e) { /* ignore */ }
    }
};
