Phase 1: Project Foundation & Game Model Core ⚙️
Duration: ~2-3 hours
Focus: Pure logic, no UI/networking yet

Deliverables:
Project Structure Setup

Create package.json with TypeScript, Jest, and dev server
Set up tsconfig.json
Create basic index.html with canvas for Babylon.js
Create src/ folder structure
Game Model Implementation (src/gameModel.ts)

Core interfaces: GameState, Player, Card, Action
Game logic functions:
createInitialGame(): Returns starting game state
playCard(gameState, playerId, cardType): Applies card effects
endTurn(gameState): Switches turns, refills energy
checkWinCondition(gameState): Returns winner or null
Card effects with exact values from ProjectStructure.md
Unit Tests (tests/gameModel.test.ts)

Attack card deals 10-20 damage
Defend reduces next damage by 50%
Heal restores exactly 15 HP
Energy refill to 3 each turn
Win condition detection
Commit Message: feat: Phase 1 - Game model core with unit tests

Phase 2: 3D Rendering Foundation 🎮
Duration: ~2-3 hours
Focus: Babylon.js scene, no networking yet

Deliverables:
Babylon.js Setup (src/render.ts)

Scene initialization with lighting and camera
Two placeholder character meshes (player 1 & 2)
Basic arena environment
Render loop
State-Driven Rendering

renderGameState(gameState): Updates 3D scene based on game state
Visual feedback for active player, damage effects, healing effects
Integration Tests (tests/render.test.ts)

Scene creates successfully
Meshes update based on game state
No memory leaks in render loop
Commit Message: feat: Phase 2 - 3D rendering with Babylon.js

Phase 3: UI Layer & Local Game Loop 🎨
Duration: ~2-3 hours
Focus: Complete local gameplay experience

Deliverables:
HTML/CSS UI (index.html, styles.css)

HUD showing both players' HP and energy
Card buttons (Attack, Defend, Heal)
Turn indicator
Victory/Defeat overlay
UI Controller (src/uiController.ts)

Event handlers for card buttons
Local game loop (no networking)
UI state management
Win/loss screen display
Integration Tests (tests/uiController.test.ts)

Button clicks trigger correct actions
UI updates reflect game state
Win screen appears at correct time
Commit Message: feat: Phase 3 - UI layer with local game loop

Phase 4: P2P Networking Layer 🔗
Duration: ~3-4 hours
Focus: PeerJS integration and state synchronization

Deliverables:
Network Manager (src/network.ts)

PeerJS connection setup (host/join)
Message serialization/deserialization
State sync protocol
Connection status handling
Message Types (src/types.ts)

PlayCardMessage: { cardType, playerId, timestamp }
EndTurnMessage: { playerId, timestamp }
FullStateSync: Complete game state
ConnectionAck: Handshake
Network Tests (tests/network.test.ts)

Message serialization
State sync accuracy
Connection error handling
Commit Message: feat: Phase 4 - P2P networking with PeerJS

Phase 5: Integration & Polish 🚀
Duration: ~2-3 hours
Focus: Connect all layers, add error handling, polish

Deliverables:
Game Orchestrator (src/gameOrchestrator.ts)

Coordinates: UI ↔ Network ↔ Game Model ↔ Render
Handles local vs. remote actions
Manages game flow (setup → play → end)
Error Handling & UX

Connection failure UI
Desync recovery
Loading states
Peer ID copy/share UI
Final Integration Tests (tests/integration.test.ts)

Full game flow test (mocked network)
End-to-end win condition
State consistency across components
Documentation & Cleanup

Update README with setup instructions
Add run scripts to package.json
Final code review and refactoring
Commit Message: feat: Phase 5 - Full integration and polish

Testing Strategy by Phase 🧪
Phase 1: Unit Tests Only
Pure logic, no dependencies
Fast, reliable tests
Phase 2: Component Tests
Test render functions in isolation
Mock Babylon.js where needed
Phase 3: Integration Tests
Test UI + Game Model together
Simulate user interactions
Phase 4: Mocked Network Tests
Test network layer with mocked PeerJS
Verify message protocols
Phase 5: End-to-End Tests
Full system test with mocked dependencies
Real browser testing (manual)
Development Workflow 🔄
Start Phase: Read this plan, check phase deliverables
Implement: Code features + tests for that phase
Test: Run tests, fix issues
Manual Test: Quick manual verification if needed
Commit: git commit -m "feat: Phase X - ..."
Push: git push origin dev
Review: Check if ready for next phase
