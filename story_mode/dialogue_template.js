// Dialogue Template — defines the canonical data structure for all story scenes.
// All chapter scene files must follow this format.
// Drop dialogue text into the dialogue array; the engine will auto-load scenes.

/**
 * DialogueScene structure:
 *   id           {string}  unique scene identifier
 *   background   {string}  background key or image path
 *   chapterTitle {string}  optional chapter heading displayed above scene
 *   dialogue     {Array}   lines of dialogue
 *     speaker    {string}  character name
 *     emotion    {string}  optional emotion tag (neutral | happy | serious | sad | confident)
 *     text       {string}  spoken line
 *     voice      {string}  optional audio file path
 *     portrait   {string}  optional portrait image path
 *     choices    {Array}   optional branching choices: [{ text, next }]
 *   next         {string}  optional next scene id for auto-advance
 */

/**
 * Create a validated dialogue scene object.
 * @param {Object} config
 * @returns {Object}
 */
function createDialogueScene(config) {
    return {
        id: config.id || "",
        background: config.background || "",
        chapterTitle: config.chapterTitle || null,
        dialogue: (config.dialogue || []).map(function(line) {
            return {
                speaker: line.speaker || "",
                emotion: line.emotion || "neutral",
                text: line.text || "",
                voice: line.voice || null,
                portrait: line.portrait || null,
                choices: line.choices || null
            };
        }),
        next: config.next || null
    };
}
