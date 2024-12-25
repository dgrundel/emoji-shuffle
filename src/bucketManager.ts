import { Bubble } from "./bubble";
import { Bucket } from "./bucket";
import { Confetti } from "./confetti";
import { Game, GameConfig } from "./game";
import { animate, clearChildren, doTimes, getChildren, takeRandom } from "./utils";

export class BucketManager extends HTMLElement {
    game: Game;
    config: GameConfig;
    undos: (() => Promise<void>)[] = [];

    constructor(game: Game) {
        super()
        this.game = game;
        this.config = game.config;

        this.setStyleProps();
    }

    setStyleProps() {
        this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
    }

    connectedCallback() {
        this.resetBuckets();
    }

    resetBuckets() {
        clearChildren(this);
        this.undos = [];
        this.generateBuckets();
    }

    generateBuckets() {
        const emojiCandidates = this.config.emojiCandidates.slice();
        const bubbles: Bubble[] = [];

        // generate all the bubbles we need
        doTimes(this.config.emojiCount, () => {
            const label = takeRandom(emojiCandidates);

            doTimes(this.config.bucketHeight, () => {
                bubbles.push(new Bubble(label));
            });
        });

        // distribute the bubbles into buckets
        doTimes(this.config.emojiCount, () => {
            const b = new Bucket(this);
            this.append(b);

            doTimes(this.config.bucketHeight, () => {
                b.put(takeRandom(bubbles))
            });
        });

        // add empty buckets
        doTimes(this.config.emptyCount, () => {
            const b = new Bucket(this);
            this.append(b);
        });
    }

    hasSelection(): boolean {
        return getChildren(this, Bucket).some(b => b.hasSelection());
    }

    deselect() {
        return getChildren(this, Bucket).forEach(b => b.deselect());
    }

    checkSuccess() {
        const success = getChildren(this, Bucket)
            .filter(b => !b.isEmpty())
            .every(b => b.checkSuccess());
        if (success) {
            const confetti = new Confetti();
            this.append(confetti);
        }
    }

    async tryMoveTo(dest: Bucket) {
        const src = getChildren(this, Bucket).find(b => b.hasSelection());
        if (!src) {
            console.error('Tried to move but there was no bucket.');
            return;
        }
        const selected = getChildren(src, Bubble).filter(b => b.isSelected());
        if (selected.length === 0) {
            console.error('Tried to move but there was no selection.');
            return;
        }
        const existing = getChildren(dest, Bubble);
        if (existing.length !== 0 && existing[0].textContent !== selected[0].textContent) {
            return;
        }

        const available = this.config.bucketHeight - existing.length;
        const moves = Math.min(available, selected.length);
        if (moves === 0) {
            // would be cool to do a little shake animation here.
            return;
        }
        
        const movables = selected.slice(0, moves);
        
        this.undos.push(async () => animate(movables, async () => {
            movables.forEach(m => src.prepend(m));
        }));
        
        return animate(movables, async () => {
            movables.forEach(m => dest.prepend(m));
        });
    }

    async undo() {
        const fn = this.undos.pop();
        if (fn) {
            await fn();
            this.game.triggerUpdate();
        }
    }

    triggerUpdate() {
        getChildren(this, Bucket).forEach(b => b.triggerUpdate());
        this.checkSuccess();
    }
}