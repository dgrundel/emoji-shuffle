import { Game } from "./game";

export class Controls extends HTMLElement {
    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
    }
    
    connectedCallback() {
        const undoBtn = document.createElement('button');
        undoBtn.textContent = '↩️ Undo';
        // undoBtn.addEventListener('click', () => this.game.resetGame());
        undoBtn.disabled = true;
        this.append(undoBtn);

        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 Reset';
        resetBtn.addEventListener('click', () => this.game.resetGame());
        this.append(resetBtn);
    }
}