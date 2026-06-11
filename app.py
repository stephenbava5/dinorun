Agent Instructions: Migrate DinoRun from the Existing Python Version to a New Realistic Browser-Based 3D Version
Goal
Rebuild DinoRun as a realistic, browser-playable 3D runner game using:
Babylon.js + TypeScript + Vite
The game should run inside GitHub Codespaces, preview through a forwarded browser port, and preserve the gameplay ideas/components already built in the existing Python version.
The Python file should be treated as the source of current game logic and feature intent, not as the final runtime. Extract the useful systems, rules, values, and gameplay components from the Python code and move them into the new TypeScript/Babylon.js version.

Important Design Direction
The screenshot/mockup represents the target game screen, but the new version should be a real interactive 3D game, not a static image.
The game should feel like a realistic 3D jungle-temple chase runner:


The player controls a human/character runner, not a dinosaur.


The human runner is positioned farther up the path, closer to the middle of the screen.


One or more dinosaurs are behind the player, chasing them.


The player runs forward through a jungle/temple path.


Coins appear in visible lines along the path.


Obstacles are clearly visible and must be jumped over, slid under, or avoided.


The UI includes a shop panel with skins and upgrades.


Laptop keyboard controls should work for both gameplay and shop navigation.



Technology Requirements
Use this stack:
Engine/library: Babylon.jsLanguage: TypeScriptBuild tool: ViteRuntime: BrowserWorkspace: GitHub CodespacesAssets: .glb / .gltf preferred
Set up the project so it can run with:
npm installnpm run dev
The Vite dev server should expose the game in Codespaces through the forwarded port.

Migration Requirement
We already have an initial Python file written. The agent should:


Locate the existing Python game file.


Read and understand its current structure.


Identify reusable game systems, including:


Player movement


Jumping


Sliding


Coin collection


Obstacles


Score/distance tracking


Lives/health


Shop data


Skins


Keyboard controls


Any existing game states or menus




Recreate those systems in TypeScript using Babylon.js.


Preserve the existing gameplay behavior wherever reasonable.


Do not simply discard the Python version without extracting its logic.


Keep the Python file in the repository for reference unless specifically told to remove it.



Target Project Structure
Create or migrate toward this structure:
dinorun/  package.json  vite.config.ts  tsconfig.json  index.html  src/    main.ts    game/      Game.ts      SceneManager.ts      InputManager.ts      Player.ts      DinoChaser.ts      Track.ts      Coins.ts      Obstacles.ts      Shop.ts      UI.ts      CameraController.ts      GameState.ts      types.ts    assets/      models/      textures/      audio/      ui/  legacy/    original_python_game.py
If the repo already has a structure, adapt to it rather than forcing a destructive rewrite. Preserve existing files when possible.

Core Gameplay
Player
The player should be a human/character runner, not a dinosaur.
Requirements:


Player starts in the center lane.


Player is placed farther up the path than the bottom edge of the screen.


Player runs forward automatically.


Player can move between lanes if lane movement already exists or is easy to support.


Player can jump.


Player can slide.


Player can collect coins.


Player collides with obstacles.


Player loses lives or fails according to the existing Python game rules.


Controls:
Space / ArrowUp / W = JumpArrowDown / S = SlideArrowLeft / A = Move left lane or shop navigationArrowRight / D = Move right lane or shop navigationEnter = Select / buy item in shopEscape = Pause / close panel where appropriate
Dinosaur Chasers
Dinosaurs are enemies behind the player.
Requirements:


Add at least one dinosaur behind the human runner.


Dinosaurs should appear lower on the screen/path, visually chasing the player.


Dinosaurs should not be the playable character.


Dinosaurs can be animated or placeholder 3D models initially.


The camera should make the chase readable: player ahead, dinosaurs behind.


Initial logic can be simple:


Dinosaurs follow the player’s lane loosely.


If the player hits obstacles or loses speed, dinosaurs visually get closer.


If lives reach zero, dinosaurs catch the player or the game ends.



3D World
Create a realistic jungle/temple runner environment.
Minimum requirements:


A forward path or track made of stone, dirt, or temple tiles.


Jungle walls, foliage, ruins, vines, torches, rocks, or water accents.


Repeating track segments so the game can run continuously.


Lighting and shadows.


Camera placed behind the chasing dinosaurs / behind the player, looking forward down the path.


Environment should feel more realistic than pixel-art, while preserving the DinoRun identity.


Use placeholder assets first if needed. Prefer .glb or .gltf models.

Coins
Add visible coin lines.
Requirements:


Coins should appear in clear rows or lines along the path.


Coins should be bright and easy to see.


Coins rotate or animate.


Coins are collectible.


Coin collection updates the coin counter.


Coin data should connect to the shop currency.


Suggested implementation:


Coins.ts manages coin spawning, animation, collision checks, and cleanup.


Spawn coins in patterns:


Straight center line


Left lane line


Right lane line


Arc after jump


Staggered line across lanes





Obstacles
Add visible obstacles.
Examples:


Fallen logs


Spike traps


Rocks


Low branches


Temple blocks


Broken pillars


Requirements:


Obstacles must be visible from a distance.


Some obstacles require jumping.


Some obstacles require sliding.


Some obstacles require lane switching if lane movement exists.


Collisions reduce lives, slow the player, or end the run based on the existing Python rules.


Obstacles should spawn on the track and recycle/despawn behind the player.


Suggested implementation:


Obstacles.ts manages obstacle definitions, spawning, collision checks, and cleanup.


Each obstacle should have:


Type


Lane


Position


Collision bounds


Required action: jump, slide, dodge, or block





Shop and Skins
Recreate the shop from the screenshot as an interactive UI overlay/panel.
The shop should include:
Tabs:- SKINS- POWER-UPS- COINS
The SKINS tab should include all skins/items from the screenshot:
Godzilla      1500King Kong     1500Homer         1200Bart          1200SpongeBob     1200Donald Trump  1500Bat            500Skateboard     500
Also preserve any previously requested additional skins, such as Mario and Luigi, if they already exist in the code or requirements. Put extra skins on another shop page rather than replacing the screenshot skins.
Important: skins should apply to the human/player runner, not the dinosaur chasers.
Because some screenshot skins are third-party characters, do not use copyrighted sprites without permission. Acceptable placeholder approach:


Use original placeholder models or stylized generic versions.


Keep the shop data names only if the project owner accepts the licensing risk.


Prefer internally generated/original art assets before shipping.


Shop functionality:


Show item name.


Show item/model/icon.


Show price.


Show purchased/locked/selected state.


Player can buy skins using collected coins.


Player can select owned skins.


Selected skin changes the player character.


Preserve current shop state if the Python version already has one.


Keyboard shop controls:
Left/Right or A/D = move between shop cards/pagesUp/Down or W/S = move between rows/tabs where appropriateEnter or Space = buy/select focused itemEscape = exit shop or return focus to gameplay
Mouse/touch controls should continue to work if already implemented.

UI Requirements
Build the game screen to resemble the screenshot layout, but as live UI.
Required UI elements:


Top title: Dino Run


Distance counter


Best distance


Lives indicator


Speed meter


Coin counter


Pause button


Gameplay viewport


Shop panel


Shop tabs


Shop item cards


Bottom navigation:


Home


Missions


Play


Shop


Settings




Footer controls text:


Space to jump. Down to slide. Left/Right to browse shop.




The UI may be implemented using HTML/CSS overlay above the Babylon canvas, which is recommended for speed and Codespaces compatibility.
Suggested files:
src/game/UI.tssrc/styles.css

Game States
Implement clear game states:
LOADINGMENUPLAYINGPAUSEDSHOPGAME_OVER
Expected behavior:


Game opens to the DinoRun menu/game screen.


Play starts or resumes gameplay.


Shop opens the shop panel.


Pause freezes movement/spawning.


Game over shows score/distance and restart option.


Preserve any existing Python game state logic where possible.

Asset Strategy
Use placeholder assets first so the game works end-to-end.
Recommended initial placeholders:


Player: simple humanoid capsule or free/open .glb human runner.


Dinosaurs: simple dinosaur .glb model or stylized placeholder.


Coins: gold torus/cylinder mesh.


Obstacles: logs, spike blocks, rocks made from primitives.


Track: procedural stone tiles using boxes/planes.


Jungle: trees/foliage as simple meshes or placeholder assets.


Do not block the migration waiting for perfect art. The first priority is a working playable 3D DinoRun scene.

Babylon.js Implementation Notes
Use Babylon.js systems for:


Scene creation


Meshes


Materials


Lights


Shadows


Cameras


Animation loop


Collision checks


Model loading


Particle effects if useful


Recommended components:
Game.ts- Owns engine, scene, main update loop, and game state.SceneManager.ts- Creates scene, lighting, skybox/background, fog, environment.Player.ts- Human runner mesh/model, movement, jump, slide, skin application.DinoChaser.ts- Dinosaur enemy visuals and chase behavior.Track.ts- Path segments, environment generation, recycling.Coins.ts- Coin spawning, rotation, collision, collection.Obstacles.ts- Obstacle spawning, collision, consequences.InputManager.ts- Keyboard input and input mode switching between gameplay/shop.Shop.ts- Shop data, purchase/select logic, page/tabs, persistence.UI.ts- HTML UI rendering, HUD updates, buttons, keyboard focus.CameraController.ts- Chase camera positioning and smoothing.GameState.ts- State machine or enum.

Persistence
Use browser local storage for:


Total coins


Purchased skins


Selected skin


Best distance


Settings if needed


If the Python version has saved data logic, mirror the same fields where reasonable.
Example local storage keys:
dinorun.totalCoinsdinorun.bestDistancedinorun.purchasedSkinsdinorun.selectedSkindinorun.settings

Acceptance Criteria
The migration is successful when:


The project runs in GitHub Codespaces with npm install and npm run dev.


A Babylon.js 3D scene loads in the browser.


The player is a human/character runner, not a dinosaur.


Dinosaurs appear behind the player and chase them.


The runner is farther up the path, with dinosaurs behind.


Coin lines are visible and collectible.


Obstacles are visible and affect gameplay.


Jump and slide controls work.


Distance, lives, speed, coins, and best distance display correctly.


Shop panel exists and includes the screenshot skins/items.


Shop can be navigated with keyboard controls.


Purchased/selected skins persist in local storage.


Existing useful Python game logic has been ported or intentionally replaced with documented reasoning.


The game screen resembles the DinoRun screenshot as an interactive game, not a static picture.



Development Plan
Phase 1: Repo Setup


Inspect existing files.


Move the Python file to legacy/ if appropriate.


Create Vite + TypeScript project files.


Install Babylon.js.


Create basic canvas and render loop.


Confirm game opens in Codespaces.


Phase 2: Core 3D Runner


Add scene lighting/camera.


Add track.


Add human player placeholder.


Add dinosaur chaser placeholder behind player.


Add forward movement/update loop.


Add jump and slide.


Phase 3: Coins and Obstacles


Add coin line spawning.


Add coin collection.


Add obstacle spawning.


Add obstacle collisions.


Add lives/damage/game-over logic.


Phase 4: UI and Shop


Add screenshot-inspired UI layout.


Add HUD values.


Add bottom navigation.


Add shop tabs/cards.


Add screenshot skins.


Add keyboard shop navigation.


Add persistence.


Phase 5: Polish


Improve camera smoothing.


Add realistic materials.


Add shadows/fog.


Add better placeholder assets or open licensed models.


Add animations and effects.


Tune speed, spawn rates, and difficulty.



Important Do / Do Not
Do:


Build a real playable 3D game.


Preserve useful existing Python logic.


Use Babylon.js + TypeScript + Vite.


Make the player a human/character runner.


Put dinosaurs behind the player as chasers.


Keep the shop, skins, coins, obstacles, and controls.


Make it work in GitHub Codespaces.


Do not:


Do not paste the screenshot as a static background and call it done.


Do not keep the dinosaur as the player character.


Do not remove existing gameplay features without replacing them.


Do not break keyboard controls.


Do not hardcode copyrighted sprites or models into the repo without permission.


Do not wait for final art before making the game playable.

"""
Dino Run - A web-based learning game
This Flask app serves the Dino Run game to your browser
"""

from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

if __name__ == '__main__':
    # Run the server on localhost:8080
    print("=" * 50)
    print("Dino Run is starting!")
    print("=" * 50)
    print("Open your browser to: http://localhost:8080")
    print("=" * 50)
    app.run(host='0.0.0.0', port=8080, debug=True)
