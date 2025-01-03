import { Controls } from './controls';
import { BucketManager } from './bucketManager';
import { ConfigPanel } from './config';
import { SoundController } from './sound';

export interface GameConfig {
    emojiCandidates: string[];
    emojiCount: number;
    emptyCount: number;
    bucketHeight: number;
}

export class Game extends HTMLElement {
    config: GameConfig
    soundController: SoundController;
    controls?: Controls;
    manager?: BucketManager;
    configPanel?: ConfigPanel;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.soundController = new SoundController();
    }

    connectedCallback() {
        this.controls = new Controls(this);
        this.append(this.controls);
        this.manager = new BucketManager(this);
        this.append(this.manager);
        this.configPanel = new ConfigPanel(this);
        this.append(this.configPanel);
        this.resetGame();
        this.triggerUpdate();
    }

    triggerUpdate() {
        this.controls?.triggerUpdate();
        this.manager?.triggerUpdate();
    }

    resetGame() {
        this.manager?.resetBuckets();
        this.triggerUpdate();
    }
}