import { Game } from "./game";
import { getNumberFromLocalStorage } from "./utils";

const bestStreakKey = 'best-streak';

export class StatusBar extends HTMLElement {
    game: Game;
    private bestStreak: number;
    private currentStreak: number = 0;

    constructor(game: Game) {
        super();

        this.game = game;
        this.bestStreak = getNumberFromLocalStorage(bestStreakKey, 0);
    }

    connectedCallback() {
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
        this.textContent = `Current streak: ${this.currentStreak} (Best streak: ${this.bestStreak})`;
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