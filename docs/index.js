(function () {
    'use strict';

    /**
     * This code adapted from
     * https://codepen.io/jonathanbell/pen/OvYVYw
     */
    const randomFromTo = (from, to) => {
        return Math.floor(Math.random() * (to - from + 1) + from);
    };
    class Particle {
        static possibleColors = [
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
        confetti;
        x;
        y;
        r;
        d;
        color;
        tilt;
        tiltAngleIncremental;
        tiltAngle;
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
    class Confetti extends HTMLElement {
        w;
        h;
        canvas;
        context;
        maxConfettis = 150;
        particles = [];
        constructor() {
            super();
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
            for (var i = 0; i < this.maxConfettis; i++) {
                const particle = this.particles[i];
                particle.tiltAngle += particle.tiltAngleIncremental;
                particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
                particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;
                if (particle.y <= this.h)
                    ;
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
    const animate = async (nodes, fn) => {
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
    };

    class Bubble extends HTMLElement {
        static selectedClass = 'selected';
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

    class Bucket extends HTMLElement {
        static successClass = 'success';
        manager;
        constructor(manager) {
            super();
            this.manager = manager;
        }
        connectedCallback() {
            this.addEventListener('click', this.onClick.bind(this));
        }
        put(b) {
            this.prepend(b);
        }
        async onClick(e) {
            if (this.manager.hasSelection()) {
                await this.manager.tryMoveTo(this);
                this.manager.deselect();
                this.checkSuccess();
                this.manager.checkSuccess();
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
        hasSelection() {
            return getChildren(this, Bubble).some(b => b.isSelected());
        }
        isEmpty() {
            return getChildren(this, Bubble).length === 0;
        }
        checkSuccess() {
            const bubbles = getChildren(this, Bubble);
            if (bubbles.length !== this.manager.config.bucketHeight) {
                this.classList.remove(Bucket.successClass);
                return false;
            }
            const first = bubbles.shift();
            const success = bubbles.every(b => b.textContent === first?.textContent);
            this.classList.toggle(Bucket.successClass, success);
            return success;
        }
    }

    class Controls extends HTMLElement {
        game;
        constructor(game) {
            super();
            this.game = game;
        }
        connectedCallback() {
            const undoBtn = document.createElement('button');
            undoBtn.textContent = '↩️ Undo';
            // undoBtn.addEventListener('click', () => this.game.resetGame());
            undoBtn.disabled = true;
            this.append(undoBtn);
            const resetBtn = document.createElement('button');
            resetBtn.textContent = '🔄 Reset';
            resetBtn.addEventListener('click', () => this.game.resetGame());
            this.append(resetBtn);
        }
    }

    class BucketManager extends HTMLElement {
        game;
        config;
        constructor(game) {
            super();
            this.game = game;
            this.config = game.config;
            this.setStyleProps();
        }
        setStyleProps() {
            this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
        }
        connectedCallback() {
            this.resetBuckets();
        }
        resetBuckets() {
            clearChildren(this);
            this.generateBuckets();
        }
        generateBuckets() {
            const emojiCandidates = this.config.emojiCandidates.slice();
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
                this.append(confetti);
            }
        }
        async tryMoveTo(dest) {
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

    class Game extends HTMLElement {
        config;
        manager;
        constructor(config) {
            super();
            this.config = config;
        }
        connectedCallback() {
            const manager = new BucketManager(this);
            this.manager = manager;
            this.append(manager);
            this.append(new Controls(this));
            this.resetGame();
        }
        resetGame() {
            this.manager?.resetBuckets();
        }
    }

    customElements.define('emoji-game', Game);
    customElements.define('emoji-bucket-manager', BucketManager);
    customElements.define('emoji-game-controls', Controls);
    customElements.define('emoji-game-bucket', Bucket);
    customElements.define('emoji-game-bubble', Bubble);
    customElements.define('confetti-shower', Confetti);
    const gameConfig = {
        emojiCandidates: ['🔥', '🙌', '💯', '😱', '🍪', '💖', '🍕', '🎁', '💀', '✨', '🎉', '👀', '🚀', '😍', '💎'],
        emojiCount: 7,
        emptyCount: 2,
        bucketHeight: 4,
    };
    const game = new Game(gameConfig);
    document.getElementById('root').append(game);

})();
