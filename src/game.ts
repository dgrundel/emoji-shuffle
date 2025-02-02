import { Controls } from './controls';
import { BucketManager } from './bucketManager';
import { ConfigPanel } from './configPanel';
import { SoundController } from './soundController';
import { StatusBar } from './statusBar';
import { Confetti } from './confetti';
import { createDom, getChildren } from './utils';
import { Banner } from './banner';
import { Timer } from './timer';
import { Dispatcher, MoveType } from './dispatcher';
import { stats } from './stats';
import { Victory } from './victory';
import { Dialog, simpleDialog } from './dialog';

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
        this.timer = new Timer(this);
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
        this.append(new Victory(this));

        this.resetGame();
    }

    async resetGame() {
        await this.manager?.reset();
    }

    async newGame() {
        const confirmed = await this.confirmNewGame();
        if (confirmed) {
            await this.manager?.regenerate();
        }
    }

    async confirmNewGame(): Promise<boolean> {
        if (this.statusBar && !this.statusBar.newGameShouldResetStreak()) {
            return true;
        }

        return new Promise(resolve => {
            const done = (b: boolean): boolean => {
                resolve(b);
                setTimeout(() => dialog.parentElement?.removeChild(dialog), 200);
                return true; // close dialog
            };

            const dialog = simpleDialog({
                game: this,
                content: {
                    name: 'div',
                    textContent: 'Are you sure?',
                },
                buttons: [{
                    textContent: '✅ Yes',
                    handler: () => done(true),
                }, {
                    textContent: '⬇️ No',
                    handler: () => done(false),
                }]
            });
            
            this.append(dialog);
            dialog.show();
        });
    }
}