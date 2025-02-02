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
        this.classList.remove('hidden');
    }

    hide() {
        this.classList.add('hidden');
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

        const banner = new Banner(title, message);
        banner.classList.add('collapsible', 'collapsed');
        this.append(banner);
        
        this.show();
        setTimeout(() => banner.classList.remove('collapsed'), 0);
        this.game.soundController.fanfare();

        // appending after show so confetti starts falling while visible
        this.append(new Confetti());
    }

    onNewGame() {
        this.hide();
    }
}