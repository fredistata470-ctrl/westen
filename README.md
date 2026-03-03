# Westen

A browser-based story-driven soccer game set in the fictional nation of **Westen**.

Play as **Otto Herrera** — a determined soccer player fighting to prove himself in the **Westen-Xiao League of Champions** while navigating life, family, and the rules of a rigidly governed society.

## Project Structure

```
westen/
├── index.html              # Main entry point
├── index.htm               # Redirect to index.html
├── main.js                 # Game bootstrap and chapter navigation
├── style.css               # Global styles
├── run-local.sh            # Local dev server launcher
│
├── engine/
│   └── soccerEngine.js     # Canvas-based soccer match engine
│
├── story/
│   ├── chapters.json       # Chapter definitions (story and match chapters)
│   ├── dialogueLoader.js   # Fetches and caches chapter data
│   └── storyManager.js     # Renders dialogue and manages chapter flow
│
├── dialogue_storymode/     # Extended dialogue scripts for story-mode scenes
│
└── data/
    └── teams.json          # Team roster and formation data
```

## How to Run

```bash
bash run-local.sh
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173) in your browser.

> **Note:** The game requires a local HTTP server due to `fetch()` calls for JSON data.  
> Do **not** open `index.html` directly from the filesystem.

## Gameplay

The game alternates between **story chapters** and **match chapters**:

- **Story chapters** — Dialogue scenes that advance Otto's personal narrative.
- **Match chapters** — A real-time soccer match on a canvas field, preceded and followed by interview scenes.

### Controls (during a match)

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move selected player |
| `Z` (hold) | Charge shot |
| `X` (hold) | Charge pass |
| `C` | Tackle |
| `Space` | Pause |

### Formation Select

Before each match you can pick from three formations:

| Formation | Label |
|-----------|-------|
| 2-2 | Balanced |
| 3-1 | Defensive |
| 1-3 | Attacking |

## Story Overview

| Chapter | Type | Summary |
|---------|------|---------|
| Prologue Part 1 | Story | Otto arrives on the mainland and learns how Westen society works. |
| Prologue Part 2 | Story | A flashback reveals Otto's traumatic past. |
| Chapter 1 | Story | Otto prepares for tryouts — dealing with exhaustion and a breakup. |
| Chapter 2 | Story | Otto makes the team and meets key characters. |
| Chapter 3+ | Match | League matches against rival teams. |

## Tech Stack

- Vanilla JavaScript (no frameworks or build tools)
- HTML5 Canvas (soccer engine)
- JSON (story data)
- Python `http.server` for local development
