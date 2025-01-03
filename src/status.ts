import { Game } from "./game";
import { getNumberFromLocalStorage } from "./utils";

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

        this.currentStreakDisplay = document.createElement('div');
        this.currentStreakDisplay.classList.add('status-item');

        this.bestStreakDisplay = document.createElement('div');
        this.bestStreakDisplay.classList.add('status-item');

        this.triggerUpdate();
        this.append(this.currentStreakDisplay);
        this.append(this.bestStreakDisplay);
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
            this.currentStreakDisplay.textContent = `Current streak: ${this.currentStreak}`;
        }
        if (this.bestStreakDisplay) {
            this.bestStreakDisplay.textContent = `Best streak: ${this.bestStreak}`;
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