import { Game } from "./game";
import { createCheckbox, createRange } from "./utils";

export class ConfigPanel extends HTMLElement {
    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
        this.hide();
    }

    show() {
        this.classList.remove('hide');
    }

    hide() {
        this.classList.add('hide');
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
                this.game.soundController.altClick();
                this.game.config.emojiCount = n;
                this.game.newGame();
            }
        }));

        // spares [1-4]
        wrap.append(createRange({
            label: 'Spare Buckets',
            min: 1,
            max: 4,
            value: this.game.config.emptyCount,
            handler: n => { 
                this.game.soundController.altClick();
                this.game.config.emptyCount = n;
                this.game.newGame();
            }
        }));

        // height [4 - 6]
        wrap.append(createRange({
            label: 'Bucket Height',
            min: 3,
            max: 6,
            value: this.game.config.bucketHeight,
            handler: n => { 
                this.game.soundController.altClick();
                this.game.config.bucketHeight = n;
                this.game.newGame();
            }
        }));

        wrap.append(createCheckbox({
            label: 'Sound effects',
            checked: this.game.soundController.enabled,
            handler: checked => {
                this.game.soundController.enabled = checked;
                this.game.soundController.click();
            }
        }));

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '⬇️ Close';
        closeBtn.addEventListener('click', () => {
            this.game.soundController.altClick();
            this.hide();
        });
        wrap.append(closeBtn);

        this.append(wrap);
    }
}