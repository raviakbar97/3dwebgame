// Core game model and logic for the 3D PvP Card Game
// All values match ProjectStructure.md specifications

export type CardType = 'attack' | 'defend' | 'heal';

export interface Player {
  id: 'player1' | 'player2';
  hp: number;
  energy: number;
  defendActive: boolean; // true if defend was played this turn
}

export interface GameState {
  currentPlayer: 'player1' | 'player2';
  players: {
    player1: Player;
    player2: Player;
  };
  turnNumber: number;
  gameOver: boolean;
  winner: 'player1' | 'player2' | null;
}

export interface CardAction {
  cardType: CardType;
  playerId: 'player1' | 'player2';
  timestamp: number;
}

// Constants from ProjectStructure.md
export const STARTING_HP = 100;
export const ENERGY_PER_TURN = 3;
export const ATTACK_DAMAGE_MIN = 10;
export const ATTACK_DAMAGE_MAX = 20;
export const DEFEND_REDUCTION = 0.5; // 50% reduction
export const HEAL_AMOUNT = 15;

/**
 * Creates the initial game state at the start of a match
 */
export function createInitialGame(): GameState {
  return {
    currentPlayer: 'player1',
    players: {
      player1: {
        id: 'player1',
        hp: STARTING_HP,
        energy: ENERGY_PER_TURN,
        defendActive: false
      },
      player2: {
        id: 'player2',
        hp: STARTING_HP,
        energy: ENERGY_PER_TURN,
        defendActive: false
      }
    },
    turnNumber: 1,
    gameOver: false,
    winner: null
  };
}

/**
 * Plays a card for the current player
 * Returns new game state (immutable)
 */
export function playCard(
  gameState: GameState,
  playerId: 'player1' | 'player2',
  cardType: CardType
): GameState {
  // Validate it's the player's turn
  if (gameState.currentPlayer !== playerId) {
    throw new Error(`It's not ${playerId}'s turn`);
  }

  const player = gameState.players[playerId];
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';
  const opponent = gameState.players[opponentId];

  // Check energy cost (all cards cost 1 energy for simplicity)
  if (player.energy < 1) {
    throw new Error('Not enough energy');
  }

  // Create new state
  const newState: GameState = {
    ...gameState,
    players: {
      ...gameState.players
    }
  };

  // Deduct energy
  newState.players[playerId] = {
    ...player,
    energy: player.energy - 1
  };

  // Apply card effect
  switch (cardType) {
    case 'attack':
      // Calculate damage (random between 10-20)
      const baseDamage = Math.floor(
        Math.random() * (ATTACK_DAMAGE_MAX - ATTACK_DAMAGE_MIN + 1)
      ) + ATTACK_DAMAGE_MIN;

      // Apply defend reduction if active
      const finalDamage = opponent.defendActive
        ? Math.floor(baseDamage * (1 - DEFEND_REDUCTION))
        : baseDamage;

      newState.players[opponentId] = {
        ...opponent,
        hp: Math.max(0, opponent.hp - finalDamage),
        defendActive: false // Clear defend after taking damage
      };
      break;

    case 'defend':
      // Set defend flag for next incoming attack
      newState.players[playerId] = {
        ...newState.players[playerId],
        defendActive: true
      };
      break;

    case 'heal':
      // Restore 15 HP, cap at starting HP
      newState.players[playerId] = {
        ...newState.players[playerId],
        hp: Math.min(STARTING_HP, player.hp + HEAL_AMOUNT)
      };
      break;
  }

  // Check win condition
  return checkWinCondition(newState);
}

/**
 * Ends the current player's turn
 * Switches to other player, refills energy
 * Defend flags are cleared when the defending player starts their next turn
 */
export function endTurn(gameState: GameState): GameState {
  if (gameState.gameOver) {
    return gameState;
  }

  const nextPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';

  const newState: GameState = {
    ...gameState,
    currentPlayer: nextPlayer,
    turnNumber: gameState.turnNumber + 1,
    players: {
      ...gameState.players,
      // Refill energy for the next player
      [nextPlayer]: {
        ...gameState.players[nextPlayer],
        energy: ENERGY_PER_TURN
      }
    }
  };

  return newState;
}

/**
 * Checks if the game is over and updates winner
 */
export function checkWinCondition(gameState: GameState): GameState {
  const p1Hp = gameState.players.player1.hp;
  const p2Hp = gameState.players.player2.hp;

  if (p1Hp <= 0 && p2Hp <= 0) {
    // Draw (rare edge case)
    return {
      ...gameState,
      gameOver: true,
      winner: null
    };
  } else if (p1Hp <= 0) {
    return {
      ...gameState,
      gameOver: true,
      winner: 'player2'
    };
  } else if (p2Hp <= 0) {
    return {
      ...gameState,
      gameOver: true,
      winner: 'player1'
    };
  }

  return gameState;
}

/**
 * Validates if a card can be played
 */
export function canPlayCard(
  gameState: GameState,
  playerId: 'player1' | 'player2',
  cardType: CardType
): boolean {
  if (gameState.gameOver) return false;
  if (gameState.currentPlayer !== playerId) return false;
  if (gameState.players[playerId].energy < 1) return false;
  return true;
}

/**
 * Gets the opponent's ID
 */
export function getOpponentId(playerId: 'player1' | 'player2'): 'player1' | 'player2' {
  return playerId === 'player1' ? 'player2' : 'player1';
}