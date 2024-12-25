import { getChildren } from './utils';
import { Bubble } from './bubble';
import { Game } from './game';

export class Bucket extends HTMLElement {
    private static successClass = 'success';
    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    connectedCallback() {
        this.addEventListener('click', this.onClick.bind(this));
    }

    put(b: Bubble) {
        this.prepend(b);
    }

    async onClick(e: MouseEvent) {
        if (this.game.hasSelection()) {
            await this.game.tryMoveTo(this);
            this.game.deselect();
            this.checkSuccess();
            this.game.checkSuccess();
        } else {
            this.select();
        }
    }

    select() {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length === 0) {
            return;
        }
        const first = bubbles.shift();
        first?.select();
        for (let i = 0; i < bubbles.length; i++) {
            if (bubbles[i].textContent !== first?.textContent) {
                break;
            }
            bubbles[i].select();
        }
    }

    deselect() {
        getChildren(this, Bubble).forEach(b => b.deselect());
    }
    
    hasSelection(): boolean {
        return getChildren(this, Bubble).some(b => b.isSelected());
    }

    isEmpty(): boolean {
        return getChildren(this, Bubble).length === 0;
    }

    checkSuccess(): boolean {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length !== this.game.config.bucketHeight) {
            this.classList.remove(Bucket.successClass);
            return false;
        }
        const first = bubbles.shift();
        const success = bubbles.every(b => b.textContent === first?.textContent);
        this.classList.toggle(Bucket.successClass, success);
        return success;
    }
}