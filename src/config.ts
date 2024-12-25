import { Game } from "./game";
import { createRange } from "./utils";

export class ConfigPanel extends HTMLElement {
    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    connectedCallback() {
        const wrap = document.createElement('div');
        wrap.classList.add('config-wrap');

        // emojis [5 - ?]
        wrap.append(createRange({
            label: 'Emoji Count',
            min: 5,
            max: this.game.config.emojiCandidates.length,
            value: this.game.config.emojiCount,
            handler: n => { 
                this.game.config.emojiCount = n;
                this.game.resetGame();
            }
        }));

        // spares [1-4]
        wrap.append(createRange({
            label: 'Spare Buckets',
            min: 1,
            max: 4,
            value: this.game.config.emptyCount,
            handler: n => { 
                this.game.config.emptyCount = n;
                this.game.resetGame();
            }
        }));

        // height [4 - 6]
        wrap.append(createRange({
            label: 'Bucket Height',
            min: 3,
            max: 6,
            value: this.game.config.bucketHeight,
            handler: n => { 
                this.game.config.bucketHeight = n;
                this.game.resetGame();
            }
        }));

        this.append(wrap);
    }
}