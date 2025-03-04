import { Game } from "./game";

export class Controls extends HTMLElement {
    game: Game;
    undoBtn?: HTMLButtonElement;
    newBtn?: HTMLButtonElement;
    resetBtn?: HTMLButtonElement;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    updateUI() {
        if (this.undoBtn) {
            this.undoBtn.disabled = this.game.manager?.undos.length === 0;
        }
        if (this.resetBtn) {
            this.resetBtn.disabled = this.game.manager?.undos.length === 0;
        }
    }

    connectedCallback() {
        this.game.dispatcher.onMoved(this.updateUI.bind(this));
        this.game.dispatcher.onWon(this.updateUI.bind(this));

        this.createDom();
        this.updateUI();
    }

    createDom() {
        this.undoBtn = document.createElement('button');
        this.undoBtn.textContent = '↩️ Undo';
        this.undoBtn.addEventListener('click', () => {
            this.game.soundController.altClick();
            this.game.manager?.undo();
        });
        this.append(this.undoBtn);

        this.resetBtn = document.createElement('button');
        this.resetBtn.textContent = '🔄 Reset';
        this.resetBtn.addEventListener('click', () => {
            this.game.soundController.altClick();
            this.game.resetGame();
        });
        this.append(this.resetBtn);

        this.newBtn = document.createElement('button');
        this.newBtn.textContent = '⏩ New';
        this.newBtn.addEventListener('click', () => {
            this.game.soundController.altClick();
            this.game.newGame();
        });
        this.append(this.newBtn);

        // const configBtn = document.createElement('button');
        // configBtn.textContent = '⚙️';
        // configBtn.addEventListener('click', () => {
        //     this.game.soundController.click();
        //     this.game.configPanel?.show();
        // });
        // this.append(configBtn);
    }
}