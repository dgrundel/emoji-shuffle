import { Game } from "./game";
import { stats } from "./stats";
import { createDom } from "./utils";

export class StatusBar extends HTMLElement {
    game: Game;
    currentStreakDisplay?: HTMLElement;
    bestStreakDisplay?: HTMLElement;
    prevWin: boolean = true; // start true so that initial new game event doesn't break streak

    constructor(game: Game) {
        super();

        this.game = game;
    }

    connectedCallback() {
        this.game.dispatcher.onWon(this.onWon.bind(this));
        this.game.dispatcher.onNewGame(this.onNewGame.bind(this));

        const streakDom = createDom({
            classes: ['status-item'],
            textContent: 'Streak: ',
            children: [{
                name: 'em',
                ref: 'display'
            }]
        });
        this.append(streakDom.root);
        this.currentStreakDisplay = streakDom.refs['display'];

        const bestStreakDom = createDom({
            classes: ['status-item'],
            textContent: 'Best streak: ',
            children: [{
                name: 'em',
                ref: 'display'
            }]
        });
        this.append(bestStreakDom.root);
        this.bestStreakDisplay = bestStreakDom.refs['display'];

        const { root: optionsButton } = createDom({
            name: 'button',
            textContent: '⚙️',
        });
        optionsButton.addEventListener('click', () => {
            this.game.soundController.click();
            this.game.configPanel?.show();
        });
        this.append(optionsButton);

        this.updateUI();
    }

    incrementStreak() {
        stats.currentStreak++;

        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }
    }

    // TODO: should use data binding to avoid this
    updateUI() {
        if (this.currentStreakDisplay) {
            this.currentStreakDisplay.textContent = stats.currentStreak.toFixed(0);
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
        return stats.currentStreak > 0 && !this.prevWin;
    }

    onNewGame() {
        if (this.newGameShouldResetStreak()) {
            stats.currentStreak = 0;
            this.updateUI();
        }
        this.prevWin = false;
    }
}