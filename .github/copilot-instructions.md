# Copilot / AI Agent Instructions 📋

**Purpose**: Provide essential knowledge for AI agents to be immediately productive in this 3D PvP Card Game codebase.

## 🎯 Project Overview
**3D Web PvP Card Game** - A turn-based multiplayer combat game using Babylon.js for 3D rendering and PeerJS for P2P networking. Currently in **Phase 1** (core game model complete), ready for Phase 2 (3D rendering).

**Current State**: ✅ Phase 1 complete with 25/25 tests passing. Game model is fully implemented and tested. Ready to build 3D rendering layer.

---

## 🏗️ Architecture & Key Patterns

### **Layered Architecture** (Critical for Separation of Concerns)
```
┌─────────────────────────────────────┐
│  UI Layer (main.ts)                 │  ← Event handlers, DOM manipulation
├─────────────────────────────────────┤
│  Game Model (gameModel.ts)          │  ← Pure logic, state management
├─────────────────────────────────────┤
│  3D Render Layer (render.ts)        │  ← Babylon.js scene management
├─────────────────────────────────────┤
│  Network Layer (network.ts)         │  ← PeerJS, message protocols
└─────────────────────────────────────┘
```

**Golden Rule**: Never mix layers. Game model must remain pure and testable without Babylon.js or PeerJS dependencies.

### **State Management Pattern**
- **Immutable updates**: Functions return new state objects
- **Pure functions**: No side effects in game logic
- **Validation first**: Check conditions before mutating state
- **Example from `gameModel.ts`**:
```typescript
// ✅ GOOD: Pure, immutable, testable
export function playCard(gameState: GameState, playerId: 'player1' | 'player2', cardType: CardType): GameState {
  // Validate first
  if (gameState.currentPlayer !== playerId) throw new Error(...);
  if (player.energy < 1) throw new Error(...);
  
  // Return new state
  return {
    ...gameState,
    players: {
      ...gameState.players,
      [playerId]: { ...player, energy: player.energy - 1 }
    }
  };
}
```

---

## 🎲 Game Rules (Hard-Coded Values)
These values are **enforced in tests** and must never change:

| Rule | Value | Implementation |
|------|-------|----------------|
| Starting HP | 100 | `STARTING_HP` constant |
| Attack damage | 10-20 | `ATTACK_DAMAGE_MIN/MAX` |
| Defend reduction | 50% | `DEFEND_REDUCTION = 0.5` |
| Heal amount | 15 HP | `HEAL_AMOUNT` |
| Energy per turn | 3 | `ENERGY_PER_TURN` |
| Win condition | HP ≤ 0 | `checkWinCondition()` |

**Defend Mechanic**: Defend lasts until the opponent's turn ends. After taking damage, defend flag is cleared.

---

## 🔧 Critical Developer Workflows

### **Running the Project**
```bash
# Development server (Vite)
npm run dev

# Run all tests
npm run test

# Watch tests
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Testing Strategy by Layer**
```bash
# Game Model (Pure logic - 25 tests)
npm test -- tests/gameModel.test.ts

# Main Application (DOM + logic integration)
npm test -- tests/main.test.ts

# Render Layer (Babylon.js structure)
npm test -- tests/render.test.ts
```

### **Adding New Features**
1. **Start with tests** in the appropriate test file
2. **Implement in the correct layer** (see architecture above)
3. **Run tests frequently** during development
4. **Manual testing**: Use `npm run dev` and open two browser tabs to simulate P2P

---

## 📁 File Structure & Conventions

### **Source Files**
```
src/
├── gameModel.ts      ← Core game logic (Phase 1 ✅)
├── main.ts           ← UI controller & app entry point
└── render.ts         ← Babylon.js 3D rendering (TODO)
└── network.ts        ← PeerJS networking (TODO)

tests/
├── gameModel.test.ts ← 25 comprehensive tests ✅
├── main.test.ts      ← DOM integration tests
└── render.test.ts    ← 3D rendering structure tests
```

### **Naming Conventions**
- **Functions**: camelCase (`createInitialGame`, `playCard`)
- **Interfaces**: PascalCase (`GameState`, `Player`)
- **Constants**: UPPER_SNAKE_CASE (`STARTING_HP`, `ENERGY_PER_TURN`)
- **Card types**: lowercase strings (`'attack'`, `'defend'`, `'heal'`)
- **Player IDs**: `'player1'` | `'player2'` (literal types)

### **TypeScript Patterns**
- **Strict mode enabled**: All compiler options are strict
- **Explicit return types**: Always type function returns
- **Interface-first**: Define types before implementation
- **No `any`**: Use proper types or generics

---

## 🧪 Testing Patterns (From Existing Tests)

### **Game Model Tests**
```typescript
describe('Card Type', () => {
  it('should [specific behavior]', () => {
    // Arrange: Create game state
    const game = createInitialGame();
    
    // Act: Perform action
    const result = playCard(game, 'player1', 'attack');
    
    // Assert: Check specific outcome
    expect(result.players.player2.hp).toBeLessThan(100);
  });
  
  it('should handle edge cases', () => {
    // Test error conditions
    expect(() => playCard(invalidGame, 'player2', 'attack')).toThrow();
  });
});
```

### **Integration Tests**
```typescript
describe('Full Game Flow', () => {
  it('should complete a full game', () => {
    let game = createInitialGame();
    
    // Simulate multiple turns
    game = playCard(game, 'player1', 'attack');
    game = endTurn(game);
    game = playCard(game, 'player2', 'defend');
    // ... continue until game over
    
    expect(game.gameOver).toBe(true);
  });
});
```

---

## 🔗 Integration Points & Dependencies

### **External Libraries**
- **Babylon.js** (`@babylonjs/core`, `@babylonjs/gui`): 3D rendering
- **PeerJS** (`peerjs`): P2P networking (WebRTC)
- **TypeScript**: Type safety
- **Vite**: Dev server & bundler
- **Jest**: Testing framework

### **Module Dependencies**
```
main.ts
├── imports: gameModel.ts (pure logic)
├── imports: render.ts (Babylon.js) ← TODO
└── imports: network.ts (PeerJS) ← TODO

gameModel.ts
└── no external dependencies (pure TypeScript)

render.ts
├── imports: gameModel.ts (types only)
└── imports: Babylon.js

network.ts
├── imports: gameModel.ts (types only)
└── imports: PeerJS
```

---

## 🚀 Next Steps (Phase 2 Ready)

### **Immediate Tasks**
1. **Create `src/render.ts`** with:
   - `initScene(canvas)`: Setup Babylon.js scene
   - `renderGameState(gameState)`: Update 3D scene based on state
   - `showDamageEffect(playerId)`: Visual feedback
   - `showHealEffect(playerId)`: Visual feedback
   - `disposeScene()`: Cleanup

2. **Update `src/main.ts`** to:
   - Call `initScene()` on startup
   - Call `renderGameState()` after each game state change
   - Remove `isLocalGame` flag (always local for now)

3. **Add Babylon.js tests** to `tests/render.test.ts`:
   - Scene creation
   - State-driven mesh updates
   - Memory leak prevention

### **Testing Checklist for New Code**
- [ ] Unit tests for pure logic
- [ ] Integration tests for layer interaction
- [ ] Mock external dependencies (Babylon.js, PeerJS)
- [ ] Coverage thresholds: 80% (already configured)
- [ ] Manual test: Two browser tabs playing locally

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't put game logic in UI layer** - Keep `main.ts` as coordinator only
2. **Don't mutate state directly** - Always return new objects
3. **Don't skip validation** - Check conditions before mutations
4. **Don't mix Babylon.js in game model** - Model must be pure
5. **Don't hardcode magic numbers** - Use constants from `gameModel.ts`

---

## 📝 Commit Message Convention
```
feat: Phase 2 - 3D rendering with Babylon.js
fix: Attack damage calculation when defend is active
test: Add integration tests for full game flow
refactor: Extract network message types
```

---

## 🔍 Debugging Tips

### **Game Logic Issues**
```bash
# Run specific test with verbose output
npm test -- --verbose tests/gameModel.test.ts

# Watch mode for TDD
npm run test:watch
```

### **3D Rendering Issues**
- Use browser devtools to inspect canvas
- Check Babylon.js scene inspector: `scene.debugLayer.show()`
- Verify game state is being passed correctly

### **Network Issues** (Future)
- PeerJS logs: `peer.on('error', console.error)`
- Message validation: Log all incoming/outgoing messages
- Connection state: Monitor `peer.disconnected` events

---

**This document is the single source of truth for AI agents.** Update it when adding new patterns, dependencies, or architectural decisions.