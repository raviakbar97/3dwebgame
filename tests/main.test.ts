// Main application tests
import { createInitialGame } from '../src/gameModel';

describe('Main Application', () => {
  let mockDocument: any;
  let mockWindow: any;

  beforeEach(() => {
    // Mock DOM elements
    mockDocument = {
      createElement: jest.fn((tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 800,
            height: 600,
            style: {},
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getContext: jest.fn(() => ({}))
          };
        }
        return {
          style: {},
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn(() => false)
          },
          textContent: '',
          disabled: false
        };
      }),
      getElementById: jest.fn((id: string) => {
        const elem = {
          style: {},
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn(() => false)
          },
          textContent: '',
          disabled: false,
          value: ''
        };
        return elem;
      }),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      readyState: 'complete'
    };

    mockWindow = {
      addEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      removeEventListener: jest.fn()
    };

    // Replace global document and window
    global.document = mockDocument;
    global.window = mockWindow;
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
      
      expect(() => startLocalGame('player1')).not.toThrow();
      expect(() => startLocalGame('player2')).not.toThrow();
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
      startLocalGame('player1');
      
      // Play a card
      playCardAction('attack');
      
      // Update UI
      expect(() => updateUI()).not.toThrow();
    });
  });
});