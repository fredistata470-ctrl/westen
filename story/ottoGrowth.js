// Otto Growth System — Story Mode only.
// Handles XP gain, leveling, stat recalculation, and in-match insulin mechanic.
// Training mode does NOT call any function here.

// ── XP & Level thresholds ─────────────────────────────────────────────────

const OTTO_XP_PER_LEVEL = (level) => level * 250;

// Called at the end of a story match.  result = "win" | "loss", goals = goals scored by player.
function awardMatchXP(result, goals) {
    if (!saveData || !saveData.player) return;
    const p = saveData.player;

    let xp = result === "win" ? 120 : 60;
    xp += (goals || 0) * 25;

    p.xp += xp;

    // Level up loop
    let leveled = false;
    while (p.xp >= OTTO_XP_PER_LEVEL(p.level)) {
        p.xp -= OTTO_XP_PER_LEVEL(p.level);
        p.level++;
        leveled = true;
        // Bump each core stat slightly on level-up (capped at potential ceiling)
        _applyLevelUpStatGain(p);
    }

    // Recalculate overall from stats
    _recalcOverall(p);

    if (leveled) {
        console.log(`[Otto] Level up! Now level ${p.level}, overall ${p.overall}`);
    }
}

function _applyLevelUpStatGain(p) {
    const stats = p.stats;
    const ceiling = p.potential;
    // Small random gains across all stats
    const keys = Object.keys(stats);
    keys.forEach(k => {
        if (k === "insulinControl") return; // insulin improved through story choices only
        const gain = Math.floor(Math.random() * 2) + 1; // +1 or +2
        stats[k] = Math.min(ceiling, stats[k] + gain);
    });
}

function _recalcOverall(p) {
    const stats = p.stats;
    const keys = ["speed", "shooting", "passing", "stamina", "dribbling"];
    const avg = keys.reduce((sum, k) => sum + (stats[k] || 0), 0) / keys.length;
    p.overall = Math.round(Math.min(p.potential, avg));
}

// ── In-match insulin mechanic ─────────────────────────────────────────────

// Per-frame insulin drain rate (at 60fps, 0.015/frame ≈ 0.9/second)
const INSULIN_DRAIN_RATE = 0.015;
// Threshold below which stamina drains faster and speed is reduced
const INSULIN_LOW_THRESHOLD = 30;

// Runtime insulin level — resets to insulinControl stat at match start
let ottoInsulin = 100;
// Whether the vignette warning is currently active
let insulinWarningActive = false;

// Call once at the start of each story match to initialise insulin level.
function initOttoInsulin() {
    const ctrl = (saveData && saveData.player && saveData.player.stats)
        ? saveData.player.stats.insulinControl
        : 60;
    // Starting insulin is proportional to insulinControl stat (60 stat → start at 60%)
    ottoInsulin = ctrl;
    insulinWarningActive = false;
}

// Call every frame during a story match (not training mode).
// Returns a modifier object: { speedMult, staminaDrain, vignetteAlpha }
function updateOttoInsulin() {
    ottoInsulin = Math.max(0, ottoInsulin - INSULIN_DRAIN_RATE);

    if (ottoInsulin < INSULIN_LOW_THRESHOLD) {
        insulinWarningActive = true;
        const severity = 1 - ottoInsulin / INSULIN_LOW_THRESHOLD; // 0–1
        return {
            speedMult: 1 - severity * 0.08,          // up to 8% speed penalty
            staminaDrain: 0.15 + severity * 0.15,    // drain faster
            vignetteAlpha: severity * 0.35            // subtle screen vignette
        };
    }

    insulinWarningActive = false;
    return { speedMult: 1, staminaDrain: 0.15, vignetteAlpha: 0 };
}

// Improve insulin control via a story choice (called from dialogue system).
function improveInsulinControl(amount) {
    if (!saveData || !saveData.player) return;
    const stats = saveData.player.stats;
    stats.insulinControl = Math.min(saveData.player.potential, stats.insulinControl + (amount || 2));
    _recalcOverall(saveData.player);
}
