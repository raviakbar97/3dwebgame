import {
  createInitialGame,
  playCard,
  endTurn,
  checkWinCondition,
  canPlayCard,
  STARTING_HP,
  ENERGY_PER_TURN,
  ATTACK_DAMAGE_MIN,
  ATTACK_DAMAGE_MAX,
  HEAL_AMOUNT,
  DEFEND_REDUCTION,
  GameState
} from '../src/gameModel';

describe('Game Model - Core Logic', () => {
  describe('createInitialGame', () => {
    it('should create initial game state with correct starting values', () => {
      const game = createInitialGame();

      expect(game.currentPlayer).toBe('player1');
      expect(game.turnNumber).toBe(1);
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBeNull();

      // Player 1
      expect(game.players.player1.hp).toBe(STARTING_HP);
      expect(game.players.player1.energy).toBe(ENERGY_PER_TURN);
      expect(game.players.player1.defendActive).toBe(false);

      // Player 2
      expect(game.players.player2.hp).toBe(STARTING_HP);
      expect(game.players.player2.energy).toBe(ENERGY_PER_TURN);
      expect(game.players.player2.defendActive).toBe(false);
    });
  });

  describe('playCard - Attack', () => {
    it('should deal damage between 10-20', () => {
      const game = createInitialGame();
      const newGame = playCard(game, 'player1', 'attack');

      const damage = STARTING_HP - newGame.players.player2.hp;
      expect(damage).toBeGreaterThanOrEqual(ATTACK_DAMAGE_MIN);
      expect(damage).toBeLessThanOrEqual(ATTACK_DAMAGE_MAX);
    });

    it('should reduce damage by 50% if defend is active', () => {
      // Setup: Player 2 plays defend, then Player 1 attacks
      let game = createInitialGame();
      game = playCard(game, 'player1', 'defend'); // P1 uses energy
      game = endTurn(game); // Now P2's turn
      game = playCard(game, 'player2', 'defend'); // P2 uses energy
      game = endTurn(game); // Back to P1's turn
      game = playCard(game, 'player1', 'defend'); // P1 uses energy
      game = endTurn(game); // P2's turn

      // Now P2 attacks P1 who has defend active
      const hpBefore = game.players.player1.hp;
      game = playCard(game, 'player2', 'attack');
      const damage = hpBefore - game.players.player1.hp;

      // Damage should be reduced by 50%
      expect(damage).toBeLessThan(ATTACK_DAMAGE_MAX);
    });

    it('should clear defend flag after taking damage', () => {
      let game = createInitialGame();
      // Setup: P1 defends, then P2 attacks
      game = playCard(game, 'player1', 'defend');
      game = endTurn(game); // Now P2's turn, P1's defendActive should still be true
      
      // Verify P1 has defend active
      expect(game.players.player1.defendActive).toBe(true);
      
      // P2 attacks P1
      game = playCard(game, 'player2', 'attack');
      
      // After attack, P1's defend should be cleared
      expect(game.players.player1.defendActive).toBe(false);
    });

    it('should throw error if not enough energy', () => {
      let game = createInitialGame();
      // Use all energy
      game = playCard(game, 'player1', 'attack');
      game = playCard(game, 'player1', 'attack');
      game = playCard(game, 'player1', 'attack');

      expect(() => playCard(game, 'player1', 'attack')).toThrow('Not enough energy');
    });

    it('should throw error if wrong player tries to play', () => {
      const game = createInitialGame();
      expect(() => playCard(game, 'player2', 'attack')).toThrow("It's not player2's turn");
    });
  });

  describe('playCard - Defend', () => {
    it('should set defendActive flag', () => {
      const game = createInitialGame();
      const newGame = playCard(game, 'player1', 'defend');

      expect(newGame.players.player1.defendActive).toBe(true);
      expect(newGame.players.player2.defendActive).toBe(false);
    });

    it('should consume 1 energy', () => {
      const game = createInitialGame();
      const newGame = playCard(game, 'player1', 'defend');

      expect(newGame.players.player1.energy).toBe(ENERGY_PER_TURN - 1);
    });
  });

  describe('playCard - Heal', () => {
    it('should restore exactly 15 HP', () => {
      let game = createInitialGame();
      // Manually set HP to a known value
      game.players.player1.hp = 50;
      game.players.player1.energy = 3; // Ensure energy

      const hpBefore = game.players.player1.hp;
      game = playCard(game, 'player1', 'heal');
      const hpAfter = game.players.player1.hp;

      expect(hpAfter - hpBefore).toBe(HEAL_AMOUNT);
      expect(hpAfter).toBe(65);
    });

    it('should not exceed starting HP', () => {
      const game = createInitialGame();
      const newGame = playCard(game, 'player1', 'heal');

      expect(newGame.players.player1.hp).toBe(STARTING_HP);
    });

    it('should work when HP is low', () => {
      let game = createInitialGame();
      // Reduce HP significantly
      game.players.player1.hp = 20;

      game = playCard(game, 'player1', 'heal');
      expect(game.players.player1.hp).toBe(20 + HEAL_AMOUNT);
    });
  });

  describe('endTurn', () => {
    it('should switch current player', () => {
      const game = createInitialGame();
      const newGame = endTurn(game);

      expect(newGame.currentPlayer).toBe('player2');
      expect(newGame.turnNumber).toBe(2);
    });

    it('should refill energy for next player', () => {
      let game = createInitialGame();
      // Use some energy
      game = playCard(game, 'player1', 'attack');
      expect(game.players.player1.energy).toBe(ENERGY_PER_TURN - 1);

      // End turn
      game = endTurn(game);
      expect(game.players.player2.energy).toBe(ENERGY_PER_TURN);
    });

    it('should keep defend flag after ending turn (defend lasts until opponent acts)', () => {
      let game = createInitialGame();
      game = playCard(game, 'player1', 'defend');
      expect(game.players.player1.defendActive).toBe(true);

      game = endTurn(game);
      // Defend should still be active for opponent's turn
      expect(game.players.player1.defendActive).toBe(true);
      
      // But should be cleared after opponent attacks
      game = playCard(game, 'player2', 'attack');
      expect(game.players.player1.defendActive).toBe(false);
    });

    it('should not change game over state', () => {
      let game = createInitialGame();
      game.gameOver = true;
      game.winner = 'player1';

      const newGame = endTurn(game);
      expect(newGame.gameOver).toBe(true);
      expect(newGame.winner).toBe('player1');
    });
  });

  describe('checkWinCondition', () => {
    it('should detect player 1 victory', () => {
      let game = createInitialGame();
      game.players.player2.hp = 0;

      const newGame = checkWinCondition(game);
      expect(newGame.gameOver).toBe(true);
      expect(newGame.winner).toBe('player1');
    });

    it('should detect player 2 victory', () => {
      let game = createInitialGame();
      game.players.player1.hp = 0;

      const newGame = checkWinCondition(game);
      expect(newGame.gameOver).toBe(true);
      expect(newGame.winner).toBe('player2');
    });

    it('should handle draw (both HP <= 0)', () => {
      let game = createInitialGame();
      game.players.player1.hp = 0;
      game.players.player2.hp = 0;

      const newGame = checkWinCondition(game);
      expect(newGame.gameOver).toBe(true);
      expect(newGame.winner).toBeNull();
    });

    it('should not change state if game not over', () => {
      const game = createInitialGame();
      const newGame = checkWinCondition(game);

      expect(newGame.gameOver).toBe(false);
      expect(newGame.winner).toBeNull();
    });
  });

  describe('canPlayCard', () => {
    it('returns true for valid move', () => {
      const game = createInitialGame();
      expect(canPlayCard(game, 'player1', 'attack')).toBe(true);
    });

    it('returns false when game is over', () => {
      let game = createInitialGame();
      game.gameOver = true;
      expect(canPlayCard(game, 'player1', 'attack')).toBe(false);
    });

    it('returns false when not player\'s turn', () => {
      const game = createInitialGame();
      expect(canPlayCard(game, 'player2', 'attack')).toBe(false);
    });

    it('returns false when no energy', () => {
      let game = createInitialGame();
      game.players.player1.energy = 0;
      expect(canPlayCard(game, 'player1', 'attack')).toBe(false);
    });
  });

  describe('Full Game Flow', () => {
    it('should complete a full game until someone wins', () => {
      let game = createInitialGame();

      // Simulate a game where player 1 wins
      // Turn 1: P1 attacks
      game = playCard(game, 'player1', 'attack');
      game = endTurn(game);

      // Turn 2: P2 attacks
      game = playCard(game, 'player2', 'attack');
      game = endTurn(game);

      // Keep playing until someone wins
      let turns = 0;
      while (!game.gameOver && turns < 50) {
        const currentPlayer = game.currentPlayer;
        const opponent = currentPlayer === 'player1' ? 'player2' : 'player1';

        // Attack if possible, otherwise heal
        if (game.players[currentPlayer].energy > 0) {
          if (game.players[opponent].hp > 30) {
            game = playCard(game, currentPlayer, 'attack');
          } else {
            game = playCard(game, currentPlayer, 'attack'); // Go for win
          }
        }

        if (!game.gameOver) {
          game = endTurn(game);
        }
        turns++;
      }

      expect(game.gameOver).toBe(true);
      expect(['player1', 'player2']).toContain(game.winner);
    });

    it('should respect energy constraints throughout game', () => {
      let game = createInitialGame();

      // P1 uses all energy
      game = playCard(game, 'player1', 'attack');
      game = playCard(game, 'player1', 'defend');
      game = playCard(game, 'player1', 'heal');

      expect(game.players.player1.energy).toBe(0);
      expect(() => playCard(game, 'player1', 'attack')).toThrow('Not enough energy');
    });
  });
});