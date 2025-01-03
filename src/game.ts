import { Controls } from './controls';
import { BucketManager } from './bucketManager';
import { ConfigPanel } from './config';
import { SoundController } from './sound';
import { StatusBar } from './status';

export interface GameConfig {
    emojiCandidates: string[];
    emojiCount: number;
    emptyCount: number;
    bucketHeight: number;
}

export class Game extends HTMLElement {
    config: GameConfig
    soundController: SoundController;
    statusBar?: StatusBar;
    controls?: Controls;
    manager?: BucketManager;
    configPanel?: ConfigPanel;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.soundController = new SoundController();
    }

    connectedCallback() {
        this.statusBar = new StatusBar(this);
        this.append(this.statusBar);
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
        this.statusBar?.triggerUpdate();
        this.controls?.triggerUpdate();
        this.manager?.triggerUpdate();
    }

    async resetGame() {
        await this.manager?.reset();
        this.triggerUpdate();
    }

    async newGame() {
        await this.manager?.regenerate();
        this.triggerUpdate();
    }
}