import { Confetti } from './confetti';
import { Bucket } from './bucket';
import { Bubble } from './bubble';
import { Game, GameConfig } from './game';

customElements.define('emoji-game', Game);
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
