import './style.css';
import { Game } from './game/Game';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.init();
  
  // Expose game to window for debugging
  (window as any).game = game;
});
