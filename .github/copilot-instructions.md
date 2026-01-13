# Copilot / AI Agent Instructions 📋

Purpose: Short, actionable guidance for AI coding agents to be immediately productive in this repository.

## Quick facts 🔧
- Stack (documented): **Babylon.js** (3D), **PeerJS** (P2P / WebRTC), **HTML/CSS** (HUD), **JavaScript / TypeScript** (implementation). See `ProjectStructure.md` for feature details.
- Current repo state: minimal docs only (no `src/`, `index.html`, or build scripts yet). Start by checking `ProjectStructure.md` and `README.md` to understand the intended features.

---

## Big-picture architecture & intent 🧭
- Two-player, turn-based PvP game using **P2P** connections (Peer ID host/join model).
- Game logic/model (HP, turn state, card effects) must be deterministic and network-syncable; render with Babylon.js.
- Key runtime responsibilities:
  - Networking: Peer connection establishment, message passing for actions and full state sync.
  - Game model: turn switching, energy/mana, card resolution (damage/heal/defend), win/lose detection.
  - UI: card buttons, HP labels, victory/defeat screens.

---

## Concrete rules & values (use these in tests and logic) ✅
- Starting HP: **100** per player.
- Attack card: deals **10–20** damage.
- Defend card: **reduces incoming damage by 50%** for one turn.
- Heal card: restores **15 HP**.
- Energy per turn: **3** points.
- Win condition: player HP <= 0 => show `Victory` / `Defeat`.

> These numbers are explicitly defined in `ProjectStructure.md` and should be enforced in the game model and unit tests.

---

## What to look for / immediate tasks 🛠️
- If you add implementation code, keep logic **separate** from rendering and networking (e.g., `src/gameModel.ts` vs `src/render.ts` vs `src/peer.ts`).
- Add tests for core mechanics first:
  - card resolution (attack range, defend reduction, heal amount)
  - turn switching and energy refill (3 energy/turn)
  - game end detection (HP <= 0)
  - state serialization / deserialization for network sync
- For networking, design compact message shapes (e.g., play-card, end-turn, full-state-sync) and include versioning in messages.

---

## Running / debugging notes 🔎
- Repository currently lacks scripts; to manually test during development, serve static files locally and open two browser windows/tabs to simulate peers (e.g., `npx http-server` or `python -m http.server`).
- Use browser devtools to inspect PeerJS connection logs and serialized messages.

---

## Testing & CI suggestions (practical, minimal) ✅
- Add unit tests (Jest or similar) for deterministic game logic (`tests/gameModel.test.ts`).
- For integration tests, mock PeerJS or spin up two browser instances in automated tests to validate state sync.

---

## PR / agent etiquette ✍️
- Keep changes small and focused (e.g., implement a single card or the peer handshake in one PR).
- Each PR must include tests for the behavior it implements and a short repro guide in the PR description (how to run locally, how to validate the change, example Peer IDs to try).

---

## Where to update this file ✍️
- When new conventions or scripts are added (eg. a build tool, `package.json`, `src/` layout), update this doc to keep agent guidance accurate and concrete.

---

If anything above is unclear or you want this trimmed/expanded with examples (e.g., message schema, test samples), tell me which sections to iterate on.