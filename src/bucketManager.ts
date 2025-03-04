import { Bubble } from "./bubble";
import { Bucket } from "./bucket";
import { MoveType } from "./dispatcher";
import { Game, GameConfig } from "./game";
import { persist } from "./persisted";
import { animate, AnimatedAction, clearChildren, doTimes, getChildren, shake, takeRandom } from "./utils";

const savedState = persist({
    serialized: ''
}, 'game-manager-state');

export class BucketManager extends HTMLElement {
    static emojiCandidates = [
        '🔥', '🙌', '💯', '😱', 
        '🍪', '💖', '🍕', '🎁', 
        '💀', '✨', '🎉', '👀', 
        '🚀', '😍', '💎', '⭐',
        '🫐', '🍿', '🥤', '🌮',
        '🥞', '🐥', '🎸', '💃',
    ];

    game: Game;
    config: GameConfig;
    undos: AnimatedAction[] = [];

    constructor(game: Game) {
        super()
        this.game = game;
        this.config = game.config;
    }

    connectedCallback() {
        this.game.dispatcher.onMoved(this.onMoved.bind(this));
        this.regenerate(savedState.serialized);
    }

    async regenerate(serialized?: string) {
        clearChildren(this);
        this.setStyleProps();
        this.undos = [];
        if (serialized && serialized.length > 0) {
            this.deserialize(serialized);
        } else {
            this.generateBuckets();
            savedState.serialized = this.serialize();
        }
        this.game.dispatcher.newGame();
    }

    private setStyleProps() {
        this.style.setProperty('--bucket-count', `${this.config.emojiCount + this.config.emptyCount}`);
        this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
    }

    private generateBuckets() {
        const emojiCandidates = BucketManager.emojiCandidates.slice();
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
            const b = this.addBucket();

            doTimes(this.config.bucketHeight, () => {
                b.put(takeRandom(bubbles))
            });
        });

        // add empty buckets
        doTimes(this.config.emptyCount, () => this.addBucket());
    }

    addBucket(): Bucket {
        const b = new Bucket(this);
        this.append(b);
        return b;
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
            this.won();
        }
    }

    won() {
        this.undos.splice(0, Infinity);
        this.deselect();
        this.game.dispatcher.won();
    }

    hasAvailableMoves(): boolean {
        const buckets = getChildren(this, Bucket);
        const srcs = [] as Bucket[];
        const dests = [] as Bucket[];
        
        for (let b = 0; b < buckets.length; b++) {
            const bucket = buckets[b];
            const bubbles = getChildren(bucket, Bubble);

            if (bubbles.length === 0) {
                console.log('found empty bucket');
                return true;
            }
            if (bubbles.length > 0) {
                srcs.push(bucket);
            }
            if (bubbles.length < this.game.config.bucketHeight) {
                dests.push(bucket);
            }
        }
        
        for (let i = 0; i < srcs.length; i++) {
            const src = srcs[i];
            const srcBubble = getChildren(src, Bubble)[0];

            for (let j = 0; j < dests.length; j++) {
                const dest = dests[j];
                if (src === dest) {
                    continue;
                }

                const destBubble = getChildren(dest, Bubble)[0];
                if (srcBubble.emoji === destBubble.emoji) {
                    console.log('src', src);
                    console.log('dest', dest);
                    return true;
                }
            }
        }

        return false;
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
        }).then(() => {
            this.game.soundController.pop();
            this.game.dispatcher.moved(MoveType.Move);
        });
    }

    async undo() {
        const action = this.undos.pop();
        if (action) {
            await animate(action);
            this.deselect();
            this.game.dispatcher.moved(MoveType.Undo);
        }
    }

    async reset() {
        if (this.undos.length === 0) {
            return
        }

        // empty the list of undos and get a 
        // copy of all the moves we need to perform
        // reverse the list so we perform the undo 
        // actions in the correct (reverse) order
        const actions = this.undos.splice(0).reverse();

        const nodes = actions.reduce((nodeSet, action) => {
            action.nodes.forEach(n => nodeSet.add(n));
            return nodeSet;
        }, new Set<HTMLElement>());
        
        const domChange = async () => {
            return actions.reduce((promise, action) => {
                return promise.then(() => action.domChange()); 
            }, Promise.resolve());
        };

        await animate({
            nodes: [...nodes],
            domChange,
        });

        // this.game.soundController.pop();
        this.game.dispatcher.moved(MoveType.Reset);
    }

    onMoved() {
        this.checkSuccess();
    }

    serialize(): string {
        const obj: string[][] = getChildren(this, Bucket).map(bucket => {
            return getChildren(bucket, Bubble).map(bubble => bubble.emoji)
        });

        return JSON.stringify(obj);
    }

    deserialize(s: string) {
        const buckets = JSON.parse(s);
        if (!Array.isArray(buckets)) {
            throw new Error(`serialized string could not be parsed: ${s}`);
        }

        buckets.forEach(bubbles => {
            if (!Array.isArray(bubbles)) {
                throw new Error(`invalid serialized string [bucket]: ${bubbles}`);
            }

            const b = new Bucket(this);
            this.append(b);

            bubbles.forEach(emoji => {
                if (typeof emoji !== 'string') {
                    throw new Error(`invalid serialized string [bubble]: ${emoji}`);
                }   

                b.append(new Bubble(emoji));
            })
        });
    }
}