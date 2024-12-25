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
    controls?: Controls;
    manager?: BucketManager;

    constructor(config: GameConfig) {
        super();
        this.config = config;
    }

    connectedCallback() {
        this.controls = new Controls(this);
        this.append(this.controls);
        this.manager = new BucketManager(this);
        this.append(this.manager);
        this.resetGame();
        this.triggerUpdate();
    }

    triggerUpdate() {
        this.controls?.triggerUpdate();
    }

    resetGame() {
        this.manager?.resetBuckets();
        this.triggerUpdate();
    }
}