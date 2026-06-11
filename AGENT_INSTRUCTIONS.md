# Agent Instructions for Dino Run Migration

## Context
This repository contains two Dino Run game versions:
- `dino_run.py` — the initial Python/Pygame prototype with the core game concept and welcome screen.
- `app.py`, `templates/index.html`, `static/game.js`, and `static/style.css` — the new browser-based web version built with Flask and HTML5 canvas.

The goal is to migrate the existing game components and behavior into the new web version, using the existing web app shell and canvas-based game engine.

## Objective
Create a playable Dino Run web game where:
- the player character is the focus, positioned farther up the path on-screen,
- dinosaurs are visibly chasing from behind,
- the game runs in the browser through the existing Flask app,
- gameplay uses the existing HTML/CSS/JS components rather than a static screenshot.

## High-Level Requirements
1. Maintain the Flask server entrypoint in `app.py` and render `templates/index.html`.
2. Keep the web UI structure in `templates/index.html` and `static/style.css`, while ensuring the actual playing field is the canvas element `#gameCanvas`.
3. Use the existing game logic in `static/game.js` as the basis for gameplay and animation.
4. Remove any screenshot placeholder logic and display the live game scene instead.
5. Place the player character higher on-screen so the chase perspective is clear.
6. Position dinosaurs behind the player using chase distance and perspective.
7. Preserve or improve game controls: start with `SPACE`/`ENTER`, lane changes with `LEFT` and `RIGHT`, jump with `UP`, and exit/menu with `ESC`.
8. Keep jungle aesthetics, interactive obstacles, coins, and chase tension.

## Migration Tasks
### 1. Align the existing Python design with the web version
- Use `dino_run.py` as the design reference for game state, welcome screen copy, and jungle theme.
- Port the initial game flow from Python (welcome → playing → game over) into the JS game loop.

### 2. Update `static/game.js`
- Remove screenshot-related image loading and drawing code.
- Raise the player’s base `y` position so the character appears farther up the scene.
- Adjust the ground level, jump logic, and collision zones to match the new player position.
- Ensure dinosaurs are rendered with depth behind the player using their `z` distance.
- Keep tracks for obstacles, coins, sound effects, shop interactions, and chase state.
- Use `requestAnimationFrame` to continue the live game loop.

### 3. Refine `templates/index.html`
- Ensure the canvas is clearly the game view, not a screenshot display.
- Keep supporting HUD elements like distance, best score, and wallet.
- Optionally simplify the UI so the playable block is more prominent and the shop/dashboard remains secondary.

### 4. Adjust `static/style.css`
- Make sure the styling supports the canvas game area and parallax background.
- Keep the jungle mood and panel styling.
- Confirm the canvas is visible and centered in the layout.

### 5. Validate game behavior
- Start on the welcome screen.
- Begin gameplay with `SPACE`/`ENTER`.
- Verify the runner sits farther up the path.
- Verify dinosaurs remain behind and chase visually.
- Confirm collisions, coin collection, and game over conditions still work.

## Implementation Notes
- Use the existing `Game` concept from `dino_run.py` as inspiration, but implement it in the browser canvas.
- The new version should not depend on Pygame or desktop-only mechanics.
- Treat the web app as the main delivery vehicle; `dino_run.py` remains as historical reference.
- Keep the game's theme and learning tone intact while making the chase feel like the player is running ahead of the dinos.

## Success Criteria
- The web version launches via `python app.py` on `http://localhost:8080`.
- The canvas displays the playable Dino Run scene.
- The player character is visible higher on-screen.
- Dinosaurs appear behind and chase.
- The game is clearly playable in-browser, not a static screenshot.
- Existing game components are reused instead of creating an entirely new unrelated version.
