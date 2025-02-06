import { BucketManager } from "./bucketManager";
import { Dialog } from "./dialog";
import { Game } from "./game";
import { createCheckbox, createRange } from "./utils";

// @ts-ignore
const appVersion: string = VERSION;

export class ConfigPanel extends HTMLElement {
    game: Game;
    dialog?: Dialog;

    constructor(game: Game) {
        super();
        this.game = game;
        this.hide();
    }

    show() {
        this.dialog?.show();
    }

    hide() {
        this.dialog?.hide();
    }

    connectedCallback() {
        const dialog = new Dialog();
        this.dialog = dialog;
        this.append(dialog);

        // emojis [5 - ?]
        dialog.append(createRange({
            label: 'Emoji Count',
            min: 5,
            max: BucketManager.emojiCandidates.length,
            value: this.game.config.emojiCount,
            handler: n => { 
                this.game.soundController.altClick();
                this.game.config.emojiCount = n;
                this.game.newGame();
            }
        }));

        // spares [1-4]
        dialog.append(createRange({
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
        dialog.append(createRange({
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

        dialog.append(createCheckbox({
            label: 'Sound effects',
            checked: this.game.config.soundEnabled,
            handler: checked => {
                this.game.config.soundEnabled = checked;
                this.game.soundController.click();
            }
        }));

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '⬇️ Close';
        closeBtn.addEventListener('click', () => {
            this.game.soundController.altClick();
            this.hide();
        });
        dialog.append(closeBtn);

        const verText = document.createElement('span');
        verText.textContent = `v${appVersion}`;
        verText.classList.add('version-text');
        dialog.append(verText);
    }
}