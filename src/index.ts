import { Confetti } from './confetti';
import { Bucket } from './bucket';
import { Bubble } from './bubble';
import { Game, GameConfig } from './game';
import { Controls } from './controls';
import { BucketManager } from './bucketManager';
import { ConfigPanel } from './configPanel';
import { StatusBar } from './statusBar';
import { Banner } from './banner';
import { persist } from './persisted';
import { Victory } from './victory';
import { Dialog } from './dialog';

customElements.define('emoji-game', Game);
customElements.define('emoji-game-config', ConfigPanel);
customElements.define('emoji-game-status-bar', StatusBar);
customElements.define('emoji-bucket-manager', BucketManager);
customElements.define('emoji-game-controls', Controls);
customElements.define('emoji-game-bucket', Bucket);
customElements.define('emoji-game-bubble', Bubble);
customElements.define('confetti-shower', Confetti);
customElements.define('game-banner', Banner);
customElements.define('game-victory', Victory);
customElements.define('g-dialog', Dialog);

const gameConfig: GameConfig = persist({
    emojiCount: 7,
    emptyCount: 2,
    bucketHeight: 4,
    soundEnabled: true,
}, 'game-config');
const game = new Game(gameConfig);
document.getElementById('root')!.append(game);
