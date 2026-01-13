// Main application entry point
// Bootstraps the game and connects all modules

import { initScene, renderGameState, showDamageEffect, showHealEffect } from './render';
import { createInitialGame, playCard, endTurn, canPlayCard } from './gameModel';
import type { GameState, CardType } from './gameModel';

// UI Elements
let uiElements: {
  connectionUI: HTMLElement;
  gameUI: HTMLElement;
  gameOver: HTMLElement;
  btnHost: HTMLButtonElement;
  btnAttack: HTMLButtonElement;
  btnDefend: HTMLButtonElement;
  btnHeal: HTMLButtonElement;
  btnRestart: HTMLButtonElement;
  connectionStatus: HTMLElement;
  p1Hud: HTMLElement;
  p2Hud: HTMLElement;
  p1HpFill: HTMLElement;
  p1HpText: HTMLElement;
  p1Energy: HTMLElement;
  p1Defend: HTMLElement;
  p2HpFill: HTMLElement;
  p2HpText: HTMLElement;
  p2Energy: HTMLElement;
  p2Defend: HTMLElement;
  turnIndicator: HTMLElement;
  turnNumber: HTMLElement;
  currentPlayer: HTMLElement;
  gameResult: HTMLElement;
  gameMessage: HTMLElement;
  messageArea: HTMLElement;
  turnTransition: HTMLElement;
};

// Game state
let gameState: GameState | null = null;
let isLocalGame = true; // For now, we'll do local 2-player on same device

/**
 * Initialize the application
 */
function initApp(): void {
  // Get UI elements
  cacheUIElements();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize Babylon.js scene
  const canvas = document.getElementById('renderCanvas');
  if (canvas && canvas instanceof HTMLCanvasElement) {
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
    btnAttack: document.getElementById('btn-attack') as HTMLButtonElement,
    btnDefend: document.getElementById('btn-defend') as HTMLButtonElement,
    btnHeal: document.getElementById('btn-heal') as HTMLButtonElement,
    btnRestart: document.getElementById('btn-restart') as HTMLButtonElement,
    connectionStatus: document.getElementById('connection-status')!,
    p1Hud: document.getElementById('player1-hud')!,
    p2Hud: document.getElementById('player2-hud')!,
    p1HpFill: document.getElementById('p1-hp-fill')!,
    p1HpText: document.getElementById('p1-hp-text')!,
    p1Energy: document.getElementById('p1-energy')!,
    p1Defend: document.getElementById('p1-defend')!,
    p2HpFill: document.getElementById('p2-hp-fill')!,
    p2HpText: document.getElementById('p2-hp-text')!,
    p2Energy: document.getElementById('p2-energy')!,
    p2Defend: document.getElementById('p2-defend')!,
    turnIndicator: document.getElementById('turn-indicator')!,
    turnNumber: document.getElementById('turn-number')!,
    currentPlayer: document.getElementById('current-player')!,
    gameResult: document.getElementById('game-result')!,
    gameMessage: document.getElementById('game-message')!,
    messageArea: document.getElementById('message-area')!,
    turnTransition: document.getElementById('turn-transition')!
  };
}

/**
 * Setup all event listeners
 */
function setupEventListeners(): void {
  // Start button
  uiElements.btnHost?.addEventListener('click', () => startLocalGame());

  // Card buttons
  uiElements.btnAttack?.addEventListener('click', () => playCardAction('attack'));
  uiElements.btnDefend?.addEventListener('click', () => playCardAction('defend'));
  uiElements.btnHeal?.addEventListener('click', () => playCardAction('heal'));

  // Restart button
  uiElements.btnRestart?.addEventListener('click', () => restartGame());
}

/**
 * Show a message in the notification area
 */
function showMessage(text: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 2000): void {
  uiElements.messageArea.textContent = text;
  uiElements.messageArea.className = type;
  uiElements.messageArea.classList.add('show');

  setTimeout(() => {
    uiElements.messageArea.classList.remove('show');
  }, duration);
}

/**
 * Show turn transition overlay
 */
function showTurnTransition(playerId: 'player1' | 'player2'): void {
  const playerName = playerId === 'player1' ? 'Player 1' : 'Player 2';
  uiElements.turnTransition.textContent = `${playerName}'s Turn`;
  uiElements.turnTransition.className = playerId;
  uiElements.turnTransition.classList.add('show');

  setTimeout(() => {
    uiElements.turnTransition.classList.remove('show');
  }, 1000);
}

/**
 * Update active player highlighting
 */
function updateActivePlayerHighlight(): void {
  if (!gameState) return;

  // Remove active class from both
  uiElements.p1Hud.classList.remove('active');
  uiElements.p2Hud.classList.remove('active');

  // Add active class to current player
  if (gameState.currentPlayer === 'player1') {
    uiElements.p1Hud.classList.add('active');
    uiElements.turnIndicator.classList.add('p1-turn');
    uiElements.turnIndicator.classList.remove('p2-turn');
  } else {
    uiElements.p2Hud.classList.add('active');
    uiElements.turnIndicator.classList.add('p2-turn');
    uiElements.turnIndicator.classList.remove('p1-turn');
  }
}

/**
 * Disable all card buttons
 */
function disableCardButtons(): void {
  uiElements.btnAttack.disabled = true;
  uiElements.btnDefend.disabled = true;
  uiElements.btnHeal.disabled = true;
}

/**
 * Enable card buttons based on game state
 */
function enableCardButtons(): void {
  if (!gameState || gameState.gameOver) {
    disableCardButtons();
    return;
  }

  // For local 2-player, allow current player to play
  // In Phase 4 (P2P), this would check myPlayerId
  const currentPlayer = gameState.currentPlayer;
  const canPlay = canPlayCard(gameState, currentPlayer, 'attack');
  
  uiElements.btnAttack.disabled = !canPlay;
  uiElements.btnDefend.disabled = !canPlay;
  uiElements.btnHeal.disabled = !canPlay;
}

/**
 * Start a local game
 */
function startLocalGame(): void {
  gameState = createInitialGame();
  
  showGameUI();
  updateUI();
  renderGameState(gameState);
  
  // Show welcome message
  showMessage('Game Started! Player 1 begins', 'success', 3000);
  
  // Show turn transition
  setTimeout(() => {
    showTurnTransition('player1');
  }, 500);
  
  uiElements.connectionStatus.textContent = `Local game started. Player 1 goes first!`;
  uiElements.connectionStatus.className = 'success';
}

/**
 * Play a card action
 */
function playCardAction(cardType: CardType): void {
  if (!gameState || gameState.gameOver) return;
  
  // For local 2-player, current player can play
  // In Phase 4 (P2P), this would check myPlayerId
  const currentPlayer = gameState.currentPlayer;
  
  // Check if it's valid
  if (!canPlayCard(gameState, currentPlayer, cardType)) {
    showMessage("Not your turn or not enough energy!", 'error');
    return;
  }

  // Disable buttons during action
  disableCardButtons();

  try {
    // Get opponent for effects
    const opponentId = getOpponentId(currentPlayer);
    
    // Apply the card
    gameState = playCard(gameState, currentPlayer, cardType);
    
    // Show card-specific messages
    const cardMessages = {
      attack: `⚔️ ${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'} attacks!`,
      defend: `🛡️ ${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'} defends!`,
      heal: `💚 ${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'} heals!`
    };
    showMessage(cardMessages[cardType], 'info');

    // Show visual effects
    if (cardType === 'attack') {
      showDamageEffect(opponentId);
    } else if (cardType === 'heal') {
      showHealEffect(currentPlayer);
    }

    // Update UI and render
    updateUI();
    renderGameState(gameState);

    // Check if game ended
    if (gameState.gameOver) {
      setTimeout(() => showGameOver(), 800);
      return;
    }

    // Auto-end turn after a delay
    setTimeout(() => {
      if (gameState && !gameState.gameOver) {
        endTurnWithTransition();
      }
    }, 1200);

  } catch (error) {
    showMessage(`Error: ${(error as Error).message}`, 'error');
    enableCardButtons(); // Re-enable on error
  }
}

/**
 * End turn with transition effects
 */
function endTurnWithTransition(): void {
  if (!gameState || gameState.gameOver) return;

  const nextPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
  
  // Show turn end message
  showMessage('Turn ending...', 'info', 800);
  
  // Disable buttons
  disableCardButtons();
  
  // End turn
  gameState = endTurn(gameState);
  
  // Update UI
  updateUI();
  renderGameState(gameState);
  
  // Show turn transition
  setTimeout(() => {
    showTurnTransition(nextPlayer);
    
    // Re-enable buttons after transition
    setTimeout(() => {
      enableCardButtons();
    }, 1000);
  }, 500);
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
  uiElements.p1HpText.textContent = `${p1Hp}/100`;

  // Player 1 Energy & Defend
  uiElements.p1Energy.textContent = `${gameState.players.player1.energy}`;
  uiElements.p1Defend.textContent = gameState.players.player1.defendActive ? '🛡️ DEFENDING' : '';

  // Player 2 HP
  const p2Hp = gameState.players.player2.hp;
  const p2HpPercent = Math.max(0, (p2Hp / 100) * 100);
  uiElements.p2HpFill.style.width = `${p2HpPercent}%`;
  uiElements.p2HpText.textContent = `${p2Hp}/100`;

  // Player 2 Energy & Defend
  uiElements.p2Energy.textContent = `${gameState.players.player2.energy}`;
  uiElements.p2Defend.textContent = gameState.players.player2.defendActive ? '🛡️ DEFENDING' : '';

  // Turn info
  uiElements.turnNumber.textContent = gameState.turnNumber.toString();
  uiElements.currentPlayer.textContent = 
    gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2';

  // Update active player highlighting
  updateActivePlayerHighlight();

  // Update card button states
  enableCardButtons();
}

/**
 * Show connection UI
 */
function showConnectionUI(): void {
  uiElements.connectionUI.classList.remove('hidden');
  uiElements.gameUI.classList.add('hidden');
  uiElements.gameOver.classList.add('hidden');
  uiElements.turnTransition.classList.add('hidden');
  uiElements.messageArea.classList.remove('show');
}

/**
 * Show game UI
 */
function showGameUI(): void {
  uiElements.connectionUI.classList.add('hidden');
  uiElements.gameUI.classList.remove('hidden');
  uiElements.gameOver.classList.add('hidden');
  uiElements.turnTransition.classList.add('hidden');
}

/**
 * Show game over screen
 */
function showGameOver(): void {
  if (!gameState) return;

  // Disable all buttons
  disableCardButtons();

  // Hide game UI
  uiElements.gameUI.classList.add('hidden');
  uiElements.gameOver.classList.remove('hidden');

  // Determine result and style
  let resultText: string;
  let messageText: string;
  let resultClass: string;

  if (gameState.winner === null) {
    resultText = '🤝 DRAW!';
    messageText = 'Both players defeated each other simultaneously!';
    resultClass = 'draw';
  } else {
    // For local 2-player, show winner
    const winnerNum = gameState.winner === 'player1' ? '1' : '2';
    resultText = `🏆 PLAYER ${winnerNum} WINS!`;
    messageText = `Player ${winnerNum} defeated their opponent!`;
    resultClass = 'victory';
  }

  // Update content
  uiElements.gameResult.textContent = resultText;
  uiElements.gameMessage.textContent = messageText;

  // Apply animation class
  uiElements.gameOver.className = resultClass;

  // Trigger animation
  setTimeout(() => {
    uiElements.gameOver.classList.add('show');
  }, 50);

  // Show message
  showMessage(resultText, resultClass === 'victory' ? 'success' : 'error', 3000);
}

/**
 * Restart the game
 */
function restartGame(): void {
  // Hide game over screen with animation
  uiElements.gameOver.classList.remove('show');
  
  setTimeout(() => {
    gameState = createInitialGame();
    showGameUI();
    updateUI();
    renderGameState(gameState);
    
    // Show restart message
    showMessage('Game Restarted! Player 1 begins', 'success', 2000);
    
    // Show turn transition
    setTimeout(() => {
      showTurnTransition('player1');
    }, 500);
    
    uiElements.connectionStatus.textContent = 'Game restarted!';
    uiElements.connectionStatus.className = 'success';
  }, 300);
}

// Initialize when DOM is ready (only in browser environment)
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else if (typeof window !== 'undefined') {
  initApp();
}

// Export for testing
export { initApp, startLocalGame, playCardAction, updateUI, showGameOver, restartGame };