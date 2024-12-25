"use strict";
const emoji = ['🔥', '🙌', '💯', '😱', '🍪', '💖', '🍕', '🎁', '💀', '🔵', '🟣', '🟤', '✅'];
const doTimes = (n, fn) => {
    for (let i = 0; i < n; i++) {
        fn(i);
    }
};
const takeRandom = (items) => {
    const i = Math.floor(Math.random() * items.length);
    const item = items[i];
    items.splice(i, 1);
    return item;
};
const getChildren = (parent, type) => {
    return [...parent.childNodes].filter((el) => el instanceof type);
};
const clearChildren = (node) => {
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
};
function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}
class Bubble extends HTMLElement {
    constructor(label) {
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
Bubble.selectedClass = 'selected';
class Bucket extends HTMLElement {
    constructor(game) {
        super();
        this.game = game;
    }
    connectedCallback() {
        this.addEventListener('click', this.onClick.bind(this));
    }
    put(b) {
        this.prepend(b);
    }
    onClick(e) {
        if (this.game.hasSelection()) {
            this.game.tryMoveTo(this);
            this.game.deselect();
            this.checkSuccess();
            this.game.checkSuccess();
        }
        else {
            this.select();
        }
    }
    select() {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length === 0) {
            return;
        }
        const first = bubbles.shift();
        first === null || first === void 0 ? void 0 : first.select();
        for (let i = 0; i < bubbles.length; i++) {
            if (bubbles[i].textContent !== (first === null || first === void 0 ? void 0 : first.textContent)) {
                break;
            }
            bubbles[i].select();
        }
    }
    deselect() {
        getChildren(this, Bubble).forEach(b => b.deselect());
    }
    hasSelection() {
        return getChildren(this, Bubble).some(b => b.isSelected());
    }
    isEmpty() {
        return getChildren(this, Bubble).length === 0;
    }
    checkSuccess() {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length !== this.game.config.bucketHeight) {
            this.classList.remove(Bucket.successClass);
            return false;
        }
        const first = bubbles.shift();
        const success = bubbles.every(b => b.textContent === (first === null || first === void 0 ? void 0 : first.textContent));
        this.classList.toggle(Bucket.successClass, success);
        return success;
    }
}
Bucket.successClass = 'success';
class Game extends HTMLElement {
    constructor(config) {
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
        const bubbles = [];
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
                b.put(takeRandom(bubbles));
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
    hasSelection() {
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
            document.body.append(confetti);
        }
    }
    tryMoveTo(dest) {
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
            dest.prepend(selected.shift());
        });
    }
}
class Particle {
    constructor(confetti) {
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
    }
    ;
}
Particle.possibleColors = [
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
class Confetti extends HTMLElement {
    constructor() {
        super();
        this.maxConfettis = 150;
        this.particles = [];
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
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
            if (particle.y <= this.h)
                remainingFlakes++;
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
const gameConfig = {
    emojiCount: 7,
    emptyCount: 2,
    bucketHeight: 4,
};
const game = new Game(gameConfig);
document.getElementById('root').append(game);
