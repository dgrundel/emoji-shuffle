import { Game } from "./game";

export class Controls extends HTMLElement {
    game: Game;
    undoBtn?: HTMLButtonElement;
    newBtn?: HTMLButtonElement;
    resetBtn?: HTMLButtonElement;
    powerUpsBtn?: HTMLButtonElement;

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
        this.game.dispatcher.onMoved(this.onMoved.bind(this));
        this.game.dispatcher.onWon(this.onWon.bind(this));
        this.game.dispatcher.onNewGame(this.onNewGame.bind(this));

        this.createDom();
        this.updateUI();
    }

    createDom() {
        this.undoBtn = this.createButton('↩️ Undo', () => {
            this.game.soundController.altClick();
            this.game.manager?.undo();
        });

        this.resetBtn = this.createButton('🔄 Reset', () => {
            this.game.soundController.altClick();
            this.game.resetGame();
        });

        this.newBtn = this.createButton('⏩ New', () => {
            this.game.soundController.altClick();
            this.game.newGame();
        });

        this.powerUpsBtn = this.createButton('💡', () => {
            this.game.manager?.addBucket();
        });
    }

    createButton(text: string, handler: (e: MouseEvent) => any): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.addEventListener('click', handler);
        this.append(btn);
        return btn;
    }

    onMoved() {
        this.updateUI();
    }

    onWon() {
        this.updateUI();
        if (this.powerUpsBtn) {
            this.powerUpsBtn.disabled = true
        }
    }

    onNewGame() {
        if (this.powerUpsBtn) {
            this.powerUpsBtn.disabled = false
        }
    }
}