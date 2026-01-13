// Main application entry point
// Bootstraps the 3D game and connects all modules

import { initScene, renderGameState, showDamageEffect, showHealEffect } from './render';
import { createInitialGame, playCard, endTurn, canPlayCard } from './gameModel';
import type { GameState, CardType } from './gameModel';

// UI Elements
let uiElements: {
  connectionUI: HTMLElement;
  gameUI: HTMLElement;
  gameOver: HTMLElement;
  btnHost: HTMLButtonElement;
  btnJoin: HTMLButtonElement;
  btnAttack: HTMLButtonElement;
  btnDefend: HTMLButtonElement;
  btnHeal: HTMLButtonElement;
  btnRestart: HTMLButtonElement;
  peerIdDisplay: HTMLElement;
  copyHint: HTMLElement;
  friendIdInput: HTMLInputElement;
  connectionStatus: HTMLElement;
  p1HpFill: HTMLElement;
  p1HpText: HTMLElement;
  p1Energy: HTMLElement;
  p1Defend: HTMLElement;
  p2HpFill: HTMLElement;
  p2HpText: HTMLElement;
  p2Energy: HTMLElement;
  p2Defend: HTMLElement;
  turnNumber: HTMLElement;
  currentPlayer: HTMLElement;
  gameResult: HTMLElement;
  gameMessage: HTMLElement;
};

// Game state
let gameState: GameState | null = null;
let isLocalGame = true; // For now, we'll do local 2-player on same device
let myPlayerId: 'player1' | 'player2' = 'player1';

/**
 * Initialize the application
 */
function initApp(): void {
  // Get UI elements
  cacheUIElements();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize Babylon.js scene
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  if (canvas) {
    initScene(canvas);
  }

  // Show connection UI initially
  showConnectionUI();
}

/**
 * Cache all UI elements for easy access
 */
function cacheUIElements(): void {
  uiElements = {
    connectionUI: document.getElementById('connection-ui')!,
    gameUI: document.getElementById('game-ui')!,
    gameOver: document.getElementById('game-over')!,
    btnHost: document.getElementById('btn-host') as HTMLButtonElement,
    btnJoin: document.getElementById('btn-join') as HTMLButtonElement,
    btnAttack: document.getElementById('btn-attack') as HTMLButtonElement,
    btnDefend: document.getElementById('btn-defend') as HTMLButtonElement,
    btnHeal: document.getElementById('btn-heal') as HTMLButtonElement,
    btnRestart: document.getElementById('btn-restart') as HTMLButtonElement,
    peerIdDisplay: document.getElementById('peer-id-display')!,
    copyHint: document.getElementById('copy-hint')!,
    friendIdInput: document.getElementById('friend-id-input') as HTMLInputElement,
    connectionStatus: document.getElementById('connection-status')!,
    p1HpFill: document.getElementById('p1-hp-fill')!,
    p1HpText: document.getElementById('p1-hp-text')!,
    p1Energy: document.getElementById('p1-energy')!,
    p1Defend: document.getElementById('p1-defend')!,
    p2HpFill: document.getElementById('p2-hp-fill')!,
    p2HpText: document.getElementById('p2-hp-text')!,
    p2Energy: document.getElementById('p2-energy')!,
    p2Defend: document.getElementById('p2-defend')!,
    turnNumber: document.getElementById('turn-number')!,
    currentPlayer: document.getElementById('current-player')!,
    gameResult: document.getElementById('game-result')!,
    gameMessage: document.getElementById('game-message')!
  };
}

/**
 * Setup all event listeners
 */
function setupEventListeners(): void {
  // Connection buttons
  uiElements.btnHost?.addEventListener('click', () => startLocalGame('player1'));
  uiElements.btnJoin?.addEventListener('click', () => startLocalGame('player2'));

  // Card buttons
  uiElements.btnAttack?.addEventListener('click', () => playCardAction('attack'));
  uiElements.btnDefend?.addEventListener('click', () => playCardAction('defend'));
  uiElements.btnHeal?.addEventListener('click', () => playCardAction('heal'));

  // Restart button
  uiElements.btnRestart?.addEventListener('click', () => restartGame());
}

/**
 * Start a local game (for testing without networking)
 */
function startLocalGame(playerId: 'player1' | 'player2'): void {
  myPlayerId = playerId;
  gameState = createInitialGame();
  
  // For local testing, always start with player 1
  // In real P2P, the host would be player 1
  gameState = createInitialGame();
  
  showGameUI();
  updateUI();
  renderGameState(gameState);
  
  uiElements.connectionStatus.textContent = `Local game started. You are ${playerId}`;
}

/**
 * Play a card action
 */
function playCardAction(cardType: CardType): void {
  if (!gameState || gameState.gameOver) return;
  
  // Check if it's valid
  if (!canPlayCard(gameState, myPlayerId, cardType)) {
    uiElements.connectionStatus.textContent = "Not your turn or not enough energy!";
    return;
  }

  try {
    // Apply the card
    const previousHp = gameState.players[getOpponentId(myPlayerId)].hp;
    gameState = playCard(gameState, myPlayerId, cardType);
    
    // Show visual effects
    if (cardType === 'attack') {
      showDamageEffect(getOpponentId(myPlayerId));
    } else if (cardType === 'heal') {
      showHealEffect(myPlayerId);
    }

    // Update UI and render
    updateUI();
    renderGameState(gameState);

    // Check if game ended
    if (gameState.gameOver) {
      showGameOver();
      return;
    }

    // Auto-end turn after a short delay (for local play)
    setTimeout(() => {
      if (gameState && !gameState.gameOver) {
        gameState = endTurn(gameState);
        updateUI();
        renderGameState(gameState);
      }
    }, 1000);

  } catch (error) {
    uiElements.connectionStatus.textContent = `Error: ${error.message}`;
  }
}

/**
 * Get opponent ID
 */
function getOpponentId(playerId: 'player1' | 'player2'): 'player1' | 'player2' {
  return playerId === 'player1' ? 'player2' : 'player1';
}

/**
 * Update all UI elements based on current game state
 */
function updateUI(): void {
  if (!gameState) return;

  // Player 1 HP
  const p1Hp = gameState.players.player1.hp;
  const p1HpPercent = Math.max(0, (p1Hp / 100) * 100);
  uiElements.p1HpFill.style.width = `${p1HpPercent}%`;
  uiElements.p1HpText.textContent = `HP: ${p1Hp}`;

  // Player 1 Energy & Defend
  uiElements.p1Energy.textContent = `Energy: ${gameState.players.player1.energy}`;
  uiElements.p1Defend.textContent = gameState.players.player1.defendActive ? '🛡️ DEFENDING' : '';

  // Player 2 HP
  const p2Hp = gameState.players.player2.hp;
  const p2HpPercent = Math.max(0, (p2Hp / 100) * 100);
  uiElements.p2HpFill.style.width = `${p2HpPercent}%`;
  uiElements.p2HpText.textContent = `HP: ${p2Hp}`;

  // Player 2 Energy & Defend
  uiElements.p2Energy.textContent = `Energy: ${gameState.players.player2.energy}`;
  uiElements.p2Defend.textContent = gameState.players.player2.defendActive ? '🛡️ DEFENDING' : '';

  // Turn info
  uiElements.turnNumber.textContent = gameState.turnNumber.toString();
  uiElements.currentPlayer.textContent = 
    gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2';

  // Update card button states
  const canPlay = canPlayCard(gameState, myPlayerId, 'attack');
  uiElements.btnAttack.disabled = !canPlay;
  uiElements.btnDefend.disabled = !canPlay;
  uiElements.btnHeal.disabled = !canPlay;

  // Highlight active player's HUD
  if (gameState.currentPlayer === myPlayerId) {
    uiElements.currentPlayer.style.color = '#44ff44';
  } else {
    uiElements.currentPlayer.style.color = '#ff4444';
  }
}

/**
 * Show connection UI
 */
function showConnectionUI(): void {
  uiElements.connectionUI.classList.remove('hidden');
  uiElements.gameUI.classList.add('hidden');
  uiElements.gameOver.classList.add('hidden');
}

/**
 * Show game UI
 */
function showGameUI(): void {
  uiElements.connectionUI.classList.add('hidden');
  uiElements.gameUI.classList.remove('hidden');
  uiElements.gameOver.classList.add('hidden');
}

/**
 * Show game over screen
 */
function showGameOver(): void {
  if (!gameState) return;

  uiElements.gameUI.classList.add('hidden');
  uiElements.gameOver.classList.remove('hidden');

  if (gameState.winner === null) {
    uiElements.gameResult.textContent = 'Draw!';
    uiElements.gameMessage.textContent = 'Both players defeated each other!';
  } else if (gameState.winner === myPlayerId) {
    uiElements.gameResult.textContent = 'Victory!';
    uiElements.gameMessage.textContent = 'You defeated your opponent!';
  } else {
    uiElements.gameResult.textContent = 'Defeat';
    uiElements.gameMessage.textContent = 'Better luck next time!';
  }
}

/**
 * Restart the game
 */
function restartGame(): void {
  gameState = createInitialGame();
  showGameUI();
  updateUI();
  renderGameState(gameState);
  uiElements.connectionStatus.textContent = 'Game restarted!';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for testing
export { initApp, startLocalGame, playCardAction, updateUI, showGameOver, restartGame };