import { Confetti } from './confetti';
import { Bucket } from './bucket';
import { Bubble } from './bubble';
import { Game, GameConfig } from './game';
import { Controls } from './controls';
import { BucketManager } from './bucketManager';
import { ConfigPanel } from './config';
import { StatusBar } from './status';

customElements.define('emoji-game', Game);
customElements.define('emoji-game-config', ConfigPanel);
customElements.define('emoji-game-status-bar', StatusBar);
customElements.define('emoji-bucket-manager', BucketManager);
customElements.define('emoji-game-controls', Controls);
customElements.define('emoji-game-bucket', Bucket);
customElements.define('emoji-game-bubble', Bubble);
customElements.define('confetti-shower', Confetti);

const gameConfig: GameConfig = { 
    emojiCandidates: ['🔥', '🙌', '💯', '😱', '🍪', '💖', '🍕', '🎁', '💀', '✨', '🎉', '👀', '🚀', '😍', '💎'],
    emojiCount: 7, 
    emptyCount: 2,
    bucketHeight: 4,
};
const game = new Game(gameConfig);
document.getElementById('root')!.append(game);
