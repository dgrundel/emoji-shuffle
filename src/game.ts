import { Controls } from './controls';
import { BucketManager } from './bucketManager';
import { ConfigPanel } from './configPanel';
import { SoundController } from './soundController';
import { StatusBar } from './statusBar';
import { Confetti } from './confetti';
import { getChildren } from './utils';
import { Banner } from './banner';
import { Timer } from './timer';
import { Dispatcher, MoveType } from './dispatcher';
import { stats } from './stats';

export interface GameConfig {
    emojiCount: number;
    emptyCount: number;
    bucketHeight: number;
    soundEnabled: boolean;
}

export class Game extends HTMLElement {
    config: GameConfig
    dispatcher: Dispatcher;
    soundController: SoundController;
    timer: Timer;
    statusBar?: StatusBar;
    controls?: Controls;
    manager?: BucketManager;
    configPanel?: ConfigPanel;
    won: boolean = false;

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.dispatcher = new Dispatcher(this);
        this.soundController = new SoundController(this);
        this.timer = new Timer();
    }

    connectedCallback() {
        this.statusBar = new StatusBar(this);
        this.controls = new Controls(this);
        this.manager = new BucketManager(this);
        this.configPanel = new ConfigPanel(this);

        this.dispatcher.onWon(this.onWon.bind(this));
        
        this.append(this.statusBar);
        this.append(this.controls);
        this.append(this.manager);
        this.append(this.configPanel);
        this.resetGame();
    }

    onWon() {
        this.timer.stop();

        const t = this.timer.elapsed();
        let message = `Time: ${Timer.toHuman(t)}`;
        if (t < stats.bestTime || stats.bestTime === 0) {
            stats.bestTime = t;
            message += ` New best time!`;
        } else {
            message += ` (Best: ${Timer.toHuman(stats.bestTime)})`;
        }

        this.append(new Confetti());
        this.append(new Banner('You won!', message));
        this.soundController.fanfare();
    }

    async resetGame() {
        await this.manager?.reset();
    }

    async newGame() {
        // remove confetti & banner
        getChildren(this, Confetti).forEach(c => c.parentNode?.removeChild(c));
        getChildren(this, Banner).forEach(c => c.parentNode?.removeChild(c));
        
        await this.manager?.regenerate();
    }
}