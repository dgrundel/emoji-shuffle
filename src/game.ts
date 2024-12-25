import { doTimes, takeRandom, getChildren, clearChildren, animate } from './utils';
import { Bubble } from './bubble';
import { Bucket } from './bucket';
import { Confetti } from './confetti';
import { Controls } from './controls';

export interface GameConfig {
    emojiCandidates: string[];
    emojiCount: number;
    emptyCount: number;
    bucketHeight: number;
}

export class Game extends HTMLElement {
    config: GameConfig

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.setStyleProps();
    }

    setStyleProps() {
        this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
    }

    resetBuckets() {
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

    resetGame() {
        clearChildren(this);
        this.resetBuckets();
        this.append(new Controls(this));
    }

    connectedCallback() {
        this.resetGame();
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
        return animate(movables, async () => {
            movables.forEach(m => dest.prepend(m));
        });
    }
}