import { doTimes, takeRandom, getChildren, clearChildren, animate } from './utils';
import { Bubble } from './bubble';
import { Bucket } from './bucket';
import { Confetti } from './confetti';
import { Controls } from './controls';
import { BucketManager } from './bucketManager';

export interface GameConfig {
    emojiCandidates: string[];
    emojiCount: number;
    emptyCount: number;
    bucketHeight: number;
}

export class Game extends HTMLElement {
    config: GameConfig
    manager?: BucketManager;

    constructor(config: GameConfig) {
        super();
        this.config = config;
    }

    connectedCallback() {
        const manager = new BucketManager(this);
        this.manager = manager;
        this.append(manager);
        this.append(new Controls(this));
        this.resetGame();
    }

    resetGame() {
        this.manager?.resetBuckets();
    }
}