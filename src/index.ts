const emoji = ['🔥', '🙌', '💯', '😱', '🍪', '💖', '🍕', '🎁', '💀', '🔵', '🟣', '🟤', '✅'];

const doTimes = (n: number, fn: (n: number) => void) => {
    for (let i = 0; i < n; i++) {
        fn(i);
    }
}

const takeRandom = <T>(items: T[]): T => {
    const i = Math.floor(Math.random() * items.length);
    const item = items[i];
    items.splice(i, 1);
    return item;
}

const getChildren = <T>(parent: Node, type: new (...args: any[]) => T): T[] => {
    return [...parent.childNodes].filter((el: any): el is T => el instanceof type) as T[];
}

const clearChildren = (node: Node) => {
    while (node.firstChild) {
        node.removeChild(node.lastChild!);
    }
}

class Bubble extends HTMLElement {    
    private static selectedClass = 'selected';

    constructor(label: string) {
        super();
        this.textContent = label;
    }

    select() {
        this.classList.add(Bubble.selectedClass);
    }

    deselect() {
        this.classList.remove(Bubble.selectedClass);
    }

    isSelected() {
        return this.classList.contains(Bubble.selectedClass);
    }
}

class Bucket extends HTMLElement {
    private static successClass = 'success';
    game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
    }

    connectedCallback() {
        this.addEventListener('click', this.onClick.bind(this));
    }

    put(b: Bubble) {
        this.prepend(b);
    }

    onClick(e: MouseEvent) {
        if (this.game.hasSelection()) {
            this.game.tryMoveTo(this);
            this.game.deselect();
            this.checkSuccess();
            this.game.checkSuccess();
        } else {
            this.select();
        }
    }

    select() {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length === 0) {
            return;
        }
        const first = bubbles.shift();
        first?.select();
        for (let i = 0; i < bubbles.length; i++) {
            if (bubbles[i].textContent !== first?.textContent) {
                break;
            }
            bubbles[i].select();
        }
    }

    deselect() {
        getChildren(this, Bubble).forEach(b => b.deselect());
    }
    
    hasSelection(): boolean {
        return getChildren(this, Bubble).some(b => b.isSelected());
    }

    isEmpty(): boolean {
        return getChildren(this, Bubble).length === 0;
    }

    checkSuccess(): boolean {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length !== this.game.config.bucketHeight) {
            this.classList.remove(Bucket.successClass);
            return false;
        }
        const first = bubbles.shift();
        const success = bubbles.every(b => b.textContent === first?.textContent);
        this.classList.toggle(Bucket.successClass, success);
        return success;
    }
}

interface GameConfig {
    emojiCount: number;
    emptyCount: number;
    bucketHeight: number;
}

class Game extends HTMLElement {
    config: GameConfig

    constructor(config: GameConfig) {
        super();
        this.config = config;
        this.setStyleProps();
    }

    setStyleProps() {
        this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
    }

    resetBuckets() {
        clearChildren(this);

        const emojiCandidates = emoji.slice();
        const bubbles: Bubble[] = [];

        // generate all the bubbles we need
        doTimes(this.config.emojiCount, () => {
            const label = takeRandom(emojiCandidates);

            doTimes(this.config.bucketHeight, () => {
                bubbles.push(new Bubble(label));
            });
        });

        // distribute the bubbles into buckets
        doTimes(this.config.emojiCount, () => {
            const b = new Bucket(this);
            this.append(b);

            doTimes(this.config.bucketHeight, () => {
                b.put(takeRandom(bubbles))
            });
        });

        // add empty buckets
        doTimes(this.config.emptyCount, () => {
            const b = new Bucket(this);
            this.append(b);
        });
    }

    connectedCallback() {
        this.resetBuckets();
    }

    hasSelection(): boolean {
        return getChildren(this, Bucket).some(b => b.hasSelection());
    }

    deselect() {
        return getChildren(this, Bucket).forEach(b => b.deselect());
    }

    checkSuccess() {
        const success = getChildren(this, Bucket)
            .filter(b => !b.isEmpty())
            .every(b => b.checkSuccess());
        if (success) {
            console.log('success!');
        }
    }

    tryMoveTo(dest: Bucket) {
        const src = getChildren(this, Bucket).find(b => b.hasSelection());
        if (!src) {
            console.error('Tried to move but there was no selection.');
            return;
        }
        const selected = getChildren(src, Bubble).filter(b => b.isSelected());
        const existing = getChildren(dest, Bubble);
        const available = this.config.bucketHeight - existing.length;
        const moves = Math.min(available, selected.length);
        if (moves === 0) {
            // would be cool to do a little shake animation here.
            return;
        }
        
        doTimes(moves, () => {
            dest.prepend(selected.shift()!);
        });
    }
}

customElements.define('emoji-game', Game);
customElements.define('emoji-game-bucket', Bucket);
customElements.define('emoji-game-bubble', Bubble);

const gameConfig: GameConfig = { 
    emojiCount: 7, 
    emptyCount: 2,
    bucketHeight: 4,
};
const game = new Game(gameConfig);
document.getElementById('root')!.append(game);