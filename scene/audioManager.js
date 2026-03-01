// Audio Manager — centralized audio system.
// Voice lines and SFX all route through here so dialogue and engine
// do NOT embed audio logic directly.

const audioManager = {
    _cache: {},

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

    // Play a named sound effect.
    // type: "goal_cheer" | "crowd_ooh" | "crowd_ah"
    // TODO: wire up actual Audio objects here when sound assets are available.
    playSFX(type) {
        void type; // placeholder until asset files are added
    },

    stop(src) {
        if (!src || !this._cache[src]) return;
        try {
            this._cache[src].pause();
            this._cache[src].currentTime = 0;
        } catch (_e) { /* ignore */ }
    }
};
