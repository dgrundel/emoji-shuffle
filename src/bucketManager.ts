import { Bubble } from "./bubble";
import { Bucket } from "./bucket";
import { Game, GameConfig } from "./game";
import { animate, AnimatedAction, clearChildren, doTimes, getChildren, shake, takeRandom } from "./utils";

export class BucketManager extends HTMLElement {
    game: Game;
    config: GameConfig;
    undos: AnimatedAction[] = [];

    constructor(game: Game) {
        super()
        this.game = game;
        this.config = game.config;
    }

    connectedCallback() {
        this.regenerate();
    }

    async regenerate() {
        clearChildren(this);
        this.setStyleProps();
        this.undos = [];
        this.generateBuckets();
    }

    private setStyleProps() {
        this.style.setProperty('--bucket-count', `${this.config.emojiCount + this.config.emptyCount}`);
        this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
    }

    private generateBuckets() {
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
        getChildren(this, Bucket).forEach(b => b.deselect());
    }

    checkSuccess() {
        const success = getChildren(this, Bucket)
            .filter(b => !b.isEmpty())
            .every(b => b.checkSuccess());
        if (success) {
            this.game.triggerGameWin();
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

        // no op
        if (src === dest) {
            return;
        }

        const existing = getChildren(dest, Bubble);
        if (existing.length !== 0 && existing[0].emoji !== selected[0].emoji) {
            return shake([src]);
        }

        const available = this.config.bucketHeight - existing.length;
        const moves = Math.min(available, selected.length);
        if (moves === 0) {
            return shake([dest]);
        }
        
        const movables = selected.slice(0, moves);
        
        this.undos.push({
            nodes: movables,
            domChange: async () => {
                movables.forEach(m => src.prepend(m));
            }
        });
        
        return animate({
            nodes: movables, 
            domChange: async () => {
                movables.forEach(m => dest.prepend(m));
            }
        }).then(() => this.game.soundController.pop());
    }

    async undo() {
        const action = this.undos.pop();
        if (action) {
            await animate(action);
            // this.game.soundController.pop();
            this.deselect();
            this.game.triggerUpdate();
        }
    }

    async reset() {
        if (this.undos.length === 0) {
            return
        }

        const nodes = this.undos.reduce((nodeSet, action) => {
            action.nodes.forEach(n => nodeSet.add(n));
            return nodeSet;
        }, new Set<HTMLElement>());
        
        const domChange = async () => {
            return this.undos.reduce((promise, action) => {
                return promise.then(() => action.domChange()); 
            }, Promise.resolve());
        };

        await animate({
            nodes: [...nodes],
            domChange,
        });

        // this.game.soundController.pop();
        this.undos.splice(0);
    }

    triggerUpdate() {
        getChildren(this, Bucket).forEach(b => b.triggerUpdate());
        this.checkSuccess();
    }

    triggerGameWin() {
        this.undos.splice(0, Infinity);
        this.deselect();
    }
}