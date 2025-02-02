import { Banner } from "./banner";
import { Confetti } from "./confetti";
import { Game } from "./game";
import { stats } from "./stats";
import { Timer } from "./timer";
import { takeRandom } from "./utils";

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
    }

    connectedCallback() {
        const title = takeRandom(messages.slice());
        
        const t = this.game.timer.elapsed();
        let message = `⏱️ ${Timer.toHuman(t)}`;
        if (t < stats.bestTime || stats.bestTime === 0) {
            stats.bestTime = t;
            message += ` ⚡ New best!`;
        } else {
            message += ` ⚡ Best: ${Timer.toHuman(stats.bestTime)}`;
        }

        this.append(new Confetti());
        this.append(new Banner(title, message));
        this.game.soundController.fanfare();
    }
}