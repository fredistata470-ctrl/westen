// Chapter 3 — Match
// Triggers gameplay engine, loads correct teams, detects home/away,
// and triggers crowd atmosphere system.
// Do NOT add gameplay logic here — only hooks and scene triggers.

var chapter3Match = {
    id: "ch3_match",

    // Home/away flag drives crowd volume (home = louder crowd)
    isHome: true,

    // Called when the match scene begins
    onMatchStart: function() {
        if (audioManager && audioManager.startAmbient) {
            audioManager.startAmbient();
        }
        if (audioManager && audioManager.setAmbientIntensity) {
            // Home games get louder crowd atmosphere than away games
            audioManager.setAmbientIntensity(chapter3Match.isHome ? 0.8 : 0.4);
        }
    },

    // Called when the match scene ends
    onMatchEnd: function() {
        if (audioManager && audioManager.stopAmbient) {
            audioManager.stopAmbient();
        }
    }
};
