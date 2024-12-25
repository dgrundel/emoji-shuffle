import { Game } from "./game";

export class Controls extends HTMLElement {
    game: Game;
    undoBtn?: HTMLButtonElement;
    resetBtn?: HTMLButtonElement;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    triggerUpdate() {
        if (this.undoBtn) {
            this.undoBtn.disabled = this.game.manager?.undos.length === 0;
        }
    }
    
    connectedCallback() {
        this.undoBtn = document.createElement('button');
        this.undoBtn.textContent = '↩️ Undo';
        this.undoBtn.addEventListener('click', () => {
            this.game.manager?.undo();
        });
        this.append(this.undoBtn);

        this.resetBtn = document.createElement('button');
        this.resetBtn.textContent = '🔄 Reset';
        this.resetBtn.addEventListener('click', () => this.game.resetGame());
        this.append(this.resetBtn);

        this.triggerUpdate();
    }
}