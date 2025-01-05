import { Game } from "./game";
import { createDom, getNumberFromLocalStorage } from "./utils";

const bestStreakKey = 'best-streak';

export class StatusBar extends HTMLElement {
    game: Game;
    private bestStreak: number;
    private currentStreak: number = 0;
    currentStreakDisplay?: HTMLElement;
    bestStreakDisplay?: HTMLElement;

    constructor(game: Game) {
        super();

        this.game = game;
        this.bestStreak = getNumberFromLocalStorage(bestStreakKey, 0);
    }

    connectedCallback() {
        const currDom = createDom({
            name: 'div',
            classes: ['status-item'],
            textContent: 'Current streak: ',
            children: [{
                name: 'em',
                ref: 'display'
            }]
        });
        this.append(currDom.root);
        this.currentStreakDisplay = currDom.refs['display'];

        const best = createDom({
            name: 'div',
            classes: ['status-item'],
            textContent: 'Best streak: ',
            children: [{
                name: 'em',
                ref: 'display'
            }]
        });
        this.append(best.root);
        this.bestStreakDisplay = best.refs['display'];

        this.triggerUpdate();
    }

    incrementStreak() {
        this.currentStreak++;

        if (this.currentStreak > this.bestStreak) {
            this.bestStreak = this.currentStreak;
            localStorage.setItem(bestStreakKey, this.bestStreak.toFixed(0));
        }
        
    }

    triggerUpdate() {
        if (this.currentStreakDisplay) {
            this.currentStreakDisplay.textContent = this.currentStreak.toFixed(0);
        }
        if (this.bestStreakDisplay) {
            this.bestStreakDisplay.textContent = this.bestStreak.toFixed(0);
        }
    }

    triggerGameWin() {
        this.incrementStreak();
        this.triggerUpdate();
    }

    triggerNewGame(wonPrev: boolean) {
        if (!wonPrev) {
            this.currentStreak = 0;
        }
    }
}