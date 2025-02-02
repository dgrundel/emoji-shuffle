import { Game } from "./game";
import { stats } from "./stats";
import { createDom } from "./utils";

export class StatusBar extends HTMLElement {
    game: Game;
    private currentStreak: number = 0;
    currentStreakDisplay?: HTMLElement;
    bestStreakDisplay?: HTMLElement;
    prevWin: boolean = false;

    constructor(game: Game) {
        super();

        this.game = game;
    }

    connectedCallback() {
        this.game.dispatcher.onWon(this.onWon.bind(this));
        this.game.dispatcher.onNewGame(this.onNewGame.bind(this));

        const currDom = createDom({
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
            classes: ['status-item'],
            textContent: 'Best streak: ',
            children: [{
                name: 'em',
                ref: 'display'
            }]
        });
        this.append(best.root);
        this.bestStreakDisplay = best.refs['display'];

        this.updateUI();
    }

    incrementStreak() {
        this.currentStreak++;

        if (this.currentStreak > stats.bestStreak) {
            stats.bestStreak = this.currentStreak;
        }
    }

    // TODO: should use data binding to avoid this
    updateUI() {
        if (this.currentStreakDisplay) {
            this.currentStreakDisplay.textContent = this.currentStreak.toFixed(0);
        }
        if (this.bestStreakDisplay) {
            this.bestStreakDisplay.textContent = stats.bestStreak.toFixed(0);
        }
    }

    onWon() {
        this.prevWin = true;
        this.incrementStreak();
        this.updateUI();
    }

    newGameShouldResetStreak(): boolean {
        return this.currentStreak > 0 && !this.prevWin;
    }

    onNewGame() {
        if (this.newGameShouldResetStreak()) {
            this.currentStreak = 0;
            this.updateUI();
        }
        this.prevWin = false;
    }
}