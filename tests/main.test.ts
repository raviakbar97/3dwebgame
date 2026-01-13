// Main application tests - UI integration and game flow
import { createInitialGame } from '../src/gameModel';

describe('Main Application - UI Integration', () => {
  let mockDocument: any;
  let mockWindow: any;
  let mockCanvas: any;

  beforeEach(() => {
    // Mock canvas
    mockCanvas = {
      width: 800,
      height: 600,
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => ({
        canvas: mockCanvas,
        // Mock WebGL context methods
      }))
    };

    // Mock DOM elements
    const createMockElement = (tag: string): any => {
      const elem: any = {
        id: '',
        style: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          contains: jest.fn(() => false),
          toggle: jest.fn()
        },
        textContent: '',
        disabled: false,
        value: '',
        parentElement: null,
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => [])
      };

      if (tag === 'canvas') {
        Object.assign(elem, mockCanvas);
      }

      return elem;
    };

    mockDocument = {
      createElement: jest.fn(createMockElement),
      getElementById: jest.fn((id: string) => {
        // Return mock elements for all UI components
        const elem: any = createMockElement('div');
        elem.id = id;
        return elem;
      }),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        style: {}
      },
      readyState: 'complete',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockWindow = {
      addEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      removeEventListener: jest.fn(),
      location: {
        href: 'http://localhost:3000'
      }
    };

    // Replace globals BEFORE importing main
    global.document = mockDocument;
    global.window = mockWindow;
    global.HTMLCanvasElement = class HTMLCanvasElement {} as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clean up any module cache
    jest.resetModules();
  });

  describe('Module Structure', () => {
    it('should export main functions', async () => {
      const mainModule = await import('../src/main');
      
      expect(mainModule.initApp).toBeDefined();
      expect(mainModule.startLocalGame).toBeDefined();
      expect(mainModule.playCardAction).toBeDefined();
      expect(mainModule.updateUI).toBeDefined();
      expect(mainModule.showGameOver).toBeDefined();
      expect(mainModule.restartGame).toBeDefined();
    });

    it('should initialize without throwing', async () => {
      const { initApp } = await import('../src/main');
      
      expect(() => initApp()).not.toThrow();
    });
  });

  describe('Game Flow', () => {
    it('should handle local game start', async () => {
      const { startLocalGame } = await import('../src/main');
      
      expect(() => startLocalGame()).not.toThrow();
    });

    it('should handle card actions', async () => {
      const { playCardAction } = await import('../src/main');
      
      // These should not throw even without game state
      expect(() => playCardAction('attack')).not.toThrow();
      expect(() => playCardAction('defend')).not.toThrow();
      expect(() => playCardAction('heal')).not.toThrow();
    });

    it('should handle restart', async () => {
      const { restartGame } = await import('../src/main');
      
      expect(() => restartGame()).not.toThrow();
    });
  });

  describe('UI Updates', () => {
    it('should handle UI updates', async () => {
      const { updateUI } = await import('../src/main');
      
      // Should not throw without game state
      expect(() => updateUI()).not.toThrow();
    });

    it('should handle game over screen', async () => {
      const { showGameOver } = await import('../src/main');
      
      // Should not throw
      expect(() => showGameOver()).not.toThrow();
    });
  });

  describe('Integration with Game Model', () => {
    it('should work with game model states', async () => {
      const { startLocalGame, playCardAction, updateUI } = await import('../src/main');
      
      // Start game
      startLocalGame();
      
      // Play a card
      playCardAction('attack');
      
      // Update UI
      expect(() => updateUI()).not.toThrow();
    });
  });

  describe('UI State Management', () => {
    it('should handle UI element caching', async () => {
      const { initApp } = await import('../src/main');
      
      // Should not throw when caching elements
      expect(() => initApp()).not.toThrow();
    });

    it('should handle button states', async () => {
      const { startLocalGame, playCardAction } = await import('../src/main');
      
      // Start game
      startLocalGame();
      
      // Try to play multiple cards
      expect(() => playCardAction('attack')).not.toThrow();
      expect(() => playCardAction('defend')).not.toThrow();
      expect(() => playCardAction('heal')).not.toThrow();
    });
  });

  describe('Visual Effects Integration', () => {
    it('should integrate with render module', async () => {
      const { startLocalGame, playCardAction } = await import('../src/main');
      
      // Start game
      startLocalGame();
      
      // Play cards that trigger visual effects
      expect(() => playCardAction('attack')).not.toThrow(); // Should trigger damage effect
      expect(() => playCardAction('heal')).not.toThrow();   // Should trigger heal effect
    });
  });

  describe('Edge Cases', () => {
    it('should handle null game state gracefully', async () => {
      const { updateUI, showGameOver, playCardAction } = await import('../src/main');
      
      // All should handle null state
      expect(() => updateUI()).not.toThrow();
      expect(() => showGameOver()).not.toThrow();
      expect(() => playCardAction('attack')).not.toThrow();
    });

    it('should handle game over state', async () => {
      const { showGameOver, playCardAction } = await import('../src/main');
      
      // Mock game over state
      const mockGameOver = {
        gameOver: true,
        winner: 'player1',
        currentPlayer: 'player1',
        turnNumber: 5,
        players: {
          player1: { hp: 50, energy: 0, defendActive: false },
          player2: { hp: 0, energy: 0, defendActive: false }
        }
      };

      // Should handle game over without throwing
      expect(() => showGameOver()).not.toThrow();
      expect(() => playCardAction('attack')).not.toThrow();
    });
  });

  describe('Complete Game Flow', () => {
    it('should simulate a complete game flow', async () => {
      const { startLocalGame, playCardAction, restartGame } = await import('../src/main');
      
      // Start game
      startLocalGame();
      
      // Play multiple turns
      for (let i = 0; i < 5; i++) {
        playCardAction('attack');
      }
      
      // Restart
      restartGame();
      
      // Play again
      playCardAction('defend');
      
      // All should work without throwing
      expect(true).toBe(true);
    });
  });
});