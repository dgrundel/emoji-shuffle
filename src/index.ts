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

const randomFromTo = (from: number, to: number) => {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

const animate = async (nodes: HTMLElement[], fn: () => Promise<void>): Promise<void> => {
    
    let maxDuration = 0;
    nodes.forEach(n => {
        const style = getComputedStyle(n);
        const duration = parseInt(style.getPropertyValue('--transition-duration'));
        if (!isNaN(duration)) {
            // assumining milliseconds
            maxDuration = Math.max(duration, maxDuration);
        }
        n.dataset.prevTransform = n.style.transform;
        n.style.transform = 'scale(0.0)';
    });
    await new Promise(r => setTimeout(r, maxDuration));
    await fn();
    await new Promise(r => setTimeout(r, maxDuration));
    nodes.forEach(n => {
        n.style.transform = n.dataset.prevTransform || '';
        n.dataset.prevTransform = undefined;
    });
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

    async onClick(e: MouseEvent) {
        if (this.game.hasSelection()) {
            await this.game.tryMoveTo(this);
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
            const confetti = new Confetti();
            this.append(confetti);
        }
    }

    async tryMoveTo(dest: Bucket) {
        const src = getChildren(this, Bucket).find(b => b.hasSelection());
        if (!src) {
            console.error('Tried to move but there was no bucket.');
            return;
        }
        const selected = getChildren(src, Bubble).filter(b => b.isSelected());
        if (selected.length === 0) {
            console.error('Tried to move but there was no selection.');
            return;
        }
        const existing = getChildren(dest, Bubble);
        if (existing.length !== 0 && existing[0].textContent !== selected[0].textContent) {
            return;
        }

        const available = this.config.bucketHeight - existing.length;
        const moves = Math.min(available, selected.length);
        if (moves === 0) {
            // would be cool to do a little shake animation here.
            return;
        }
        
        const movables = selected.slice(0, moves);
        return animate(movables, async () => {
            movables.forEach(m => dest.prepend(m));
        });
    }
}

class Particle {
    private static possibleColors = [
        'DodgerBlue',
        'OliveDrab',
        'Gold',
        'Pink',
        'SlateBlue',
        'LightBlue',
        'Gold',
        'Violet',
        'PaleGreen',
        'SteelBlue',
        'SandyBrown',
        'Chocolate',
        'Crimson'
    ];

    confetti: Confetti
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngleIncremental: number;
    tiltAngle: number;

    constructor(confetti: Confetti) {
        this.confetti = confetti;
        this.x = Math.random() * confetti.w; // x
        this.y = Math.random() * confetti.h - confetti.h; // y
        this.r = randomFromTo(11, 33); // radius
        this.d = Math.random() * confetti.maxConfettis + 11;
        this.color =
        Particle.possibleColors[Math.floor(Math.random() * Particle.possibleColors.length)];
        this.tilt = Math.floor(Math.random() * 33) - 11;
        this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
        this.tiltAngle = 0;
    }

    draw() {
        const context = this.confetti.context;
        context.beginPath();
        context.lineWidth = this.r / 2;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + this.r / 3, this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
        return context.stroke();
    };
}

class Confetti extends HTMLElement {
    w: number;
    h: number;
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D;
    maxConfettis = 150;
    particles: Particle[] = [];

    constructor() {
        super();
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d')!;

        this.onResize = this.onResize.bind(this);
    }

    connectedCallback() {
        window.addEventListener('resize', this.onResize);

        // Push new confetti objects to `particles[]`
        for (var i = 0; i < this.maxConfettis; i++) {
            this.particles.push(new Particle(this));
        }

        // Initialize
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.append(this.canvas);
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.draw();
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.onResize);
    }

    draw() {
        const results = [];
    
        // Magical recursive functional love
        requestAnimationFrame(this.draw.bind(this));
    
        this.context.clearRect(0, 0, this.w, window.innerHeight);
    
        for (var i = 0; i < this.maxConfettis; i++) {
            results.push(this.particles[i].draw());
        }
    
        let remainingFlakes = 0;
        for (var i = 0; i < this.maxConfettis; i++) {
            const particle = this.particles[i];
    
            particle.tiltAngle += particle.tiltAngleIncremental;
            particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
            particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;
    
            if (particle.y <= this.h) remainingFlakes++;
    
            // If a confetti has fluttered out of view,
            // bring it back to above the viewport and let if re-fall.
            if (particle.x > this.w + 30 || particle.x < -30 || particle.y > this.h) {
                particle.x = Math.random() * this.w;
                particle.y = -30;
                particle.tilt = Math.floor(Math.random() * 10) - 20;
            }
        }
    
        return results;
    }

    onResize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}

customElements.define('emoji-game', Game);
customElements.define('emoji-game-bucket', Bucket);
customElements.define('emoji-game-bubble', Bubble);
customElements.define('confetti-shower', Confetti);

const gameConfig: GameConfig = { 
    emojiCount: 7, 
    emptyCount: 2,
    bucketHeight: 4,
};
const game = new Game(gameConfig);
document.getElementById('root')!.append(game);

