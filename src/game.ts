import { Controls } from './controls';
import { BucketManager } from './bucketManager';
import { ConfigPanel } from './config';
import { SoundController } from './sound';
import { StatusBar } from './status';
import { Confetti } from './confetti';
import { getChildren } from './utils';

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
    won: boolean = false;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.soundController = new SoundController();
    }

    connectedCallback() {
        this.statusBar = new StatusBar(this);
        this.controls = new Controls(this);
        this.manager = new BucketManager(this);
        this.configPanel = new ConfigPanel(this);
        
        this.append(this.statusBar);
        this.append(this.controls);
        this.append(this.manager);
        this.append(this.configPanel);
        this.resetGame();
        this.triggerUpdate();
    }

    triggerGameWin() {
        this.won = true;

        const confetti = new Confetti();
        this.append(confetti);
        this.soundController.fanfare();

        this.manager?.triggerGameWin();
        this.controls?.triggerGameWin();
        this.statusBar?.triggerGameWin();
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
        // remove confetti
        getChildren(this, Confetti).forEach(c => c.parentNode?.removeChild(c));
        
        const wonPrev = this.won;
        this.won = false;
        this.statusBar?.triggerNewGame(wonPrev);
        await this.manager?.regenerate();
        this.triggerUpdate();
    }
}