Project: 3D Web PvP Card Game (Alpha Stage)
1. Overview
A turn-based 3D multiplayer combat game built with Babylon.js for the 3D engine and PeerJS for P2P networking. Players use a card system to strategize attacks and defenses. The goal is to reduce the opponent's HP to zero.

2. Technical Stack
• 3D Engine: Babylon.js

• Networking: PeerJS (WebRTC)

• UI: HTML/CSS (HUD) & Babylon GUI

• Language: JavaScript / TypeScript

3. Core Alpha Features
• P2P Connection: Host/Join system using Peer ID.

• Turn-Based System: Strict switching between Player 1 and Player 2.

• Basic Combat:

  • HP System: Each player starts with 100 HP.

  • Card Deck: 3 basic card types (Attack, Defend, Heal).

• 3D Environment: Simple arena with two character avatars (placeholders).

• Win/Loss Condition: Game ends when HP <= 0, showing a "Victory" or "Defeat" screen.

4. Game Logic (Alpha)
• Attack Card: Deals 10-20 damage.

• Defend Card: Reduces incoming damage by 50% for one turn.

• Heal Card: Restores 15 HP.

• Mana/Energy: Each turn gives 3 energy points to spend on cards.

5. Development Roadmap (Alpha)
1. Setup Babylon.js Scene: Basic lighting, camera, and two meshes.

2. Integrate PeerJS: Establish data connection between two peers.

3. State Sync: Syncing HP and Turn status across the network.

4. UI Overlay: Creating buttons for cards and labels for HP.

5. Game Loop: Implement the logic for ending turns and checking win conditions.

6. How to Run (Concept)
1. Open the web app.

2. Copy your Peer ID and send it to a friend.

3. Friend enters the ID and clicks "Connect".

4. The game initializes the 3D scene and the first turn begins.
