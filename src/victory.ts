import { Banner } from "./banner";
import { Confetti } from "./confetti";
import { Game } from "./game";
import { stats } from "./stats";
import { Timer } from "./timer";
import { getChildren, takeRandom } from "./utils";

const messages = [
    "Ace moves!",
    "Amazing work!",
    "Brilliant win!",
    "Champion!",
    "Crushed it!",
    "Epic!",
    "Fantastic!",
    "Legendary!",
    "Like a boss!",
    "Magnificent!",
    "Nice job!",
    "Nailed it!",
    "Outstanding!",
    "Success!",
    "Superstar!",
    "Top notch!",
    "Unstoppable!",
    "Victory!",
    "Well done!",
    "Winner winner!",
    "You did it!",
    "You rock!",
    "You're a star!",
    "You won!",
];

export class Victory extends HTMLElement {
    game: Game;

    constructor(game: Game) {
        super();

        this.game = game;
        this.hide();
    }

    connectedCallback() {
        this.game.dispatcher.onWon(this.onWon.bind(this));
        this.game.dispatcher.onNewGame(this.onNewGame.bind(this));
    }

    show() {
        this.classList.remove('hide');
    }

    hide() {
        this.classList.add('hide');
    }

    onWon() {
        const title = takeRandom(messages.slice());
        
        const t = this.game.timer.elapsed();
        let message = `⏱️ ${Timer.toHuman(t)}`;
        if (t < stats.bestTime || stats.bestTime === 0) {
            stats.bestTime = t;
            message += ` ⚡ New best!`;
        } else {
            message += ` ⚡ Best: ${Timer.toHuman(stats.bestTime)}`;
        }

        getChildren(this, Banner).forEach(c => c.parentNode?.removeChild(c));
        getChildren(this, Confetti).forEach(c => c.parentNode?.removeChild(c));

        this.append(new Banner(title, message));
        
        this.show();
        this.game.soundController.fanfare();

        // appending after show so confetti starts falling while visible
        this.append(new Confetti());
    }

    onNewGame() {
        this.hide();
    }
}