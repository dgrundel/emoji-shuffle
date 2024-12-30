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
    const createRange = (opts) => {
        const text = document.createElement('span');
        text.classList.add('range-text');
        text.textContent = opts.label;
        const display = document.createElement('span');
        display.classList.add('range-display');
        display.textContent = `${opts.value}`;
        const input = document.createElement('input');
        input.type = 'range';
        input.min = `${opts.min}`;
        input.max = `${opts.max}`;
        input.step = '1';
        input.value = `${opts.value}`;
        input.addEventListener('input', () => {
            const value = parseInt(input.value);
            opts.handler(value);
            display.textContent = `${value}`;
        });
        const label = document.createElement('label');
        label.classList.add('range-label');
        label.append(text);
        label.append(input);
        label.append(display);
        return label;
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
            }
            else {
                this.select();
            }
            this.manager.game.triggerUpdate();
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
        triggerUpdate() {
            this.checkSuccess();
        }
    }

    class Controls extends HTMLElement {
        game;
        undoBtn;
        resetBtn;
        constructor(game) {
            super();
            this.game = game;
        }
        triggerUpdate() {
            if (this.undoBtn) {
                this.undoBtn.disabled = this.game.manager?.undos.length === 0;
            }
        }
        connectedCallback() {
            this.undoBtn = document.createElement('button');
            this.undoBtn.textContent = '↩️ Undo';
            this.undoBtn.addEventListener('click', () => {
                this.game.manager?.undo();
            });
            this.append(this.undoBtn);
            this.resetBtn = document.createElement('button');
            this.resetBtn.textContent = '🔄 Reset';
            this.resetBtn.addEventListener('click', () => this.game.resetGame());
            this.append(this.resetBtn);
            const configBtn = document.createElement('button');
            configBtn.textContent = '⚙️';
            configBtn.addEventListener('click', () => this.game.configPanel?.show());
            this.append(configBtn);
            this.triggerUpdate();
        }
    }

    class BucketManager extends HTMLElement {
        game;
        config;
        undos = [];
        constructor(game) {
            super();
            this.game = game;
            this.config = game.config;
        }
        setStyleProps() {
            this.style.setProperty('--bucket-count', `${this.config.emojiCount + this.config.emptyCount}`);
            this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
        }
        connectedCallback() {
            this.resetBuckets();
        }
        resetBuckets() {
            clearChildren(this);
            this.setStyleProps();
            this.undos = [];
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
            getChildren(this, Bucket).forEach(b => b.deselect());
        }
        checkSuccess() {
            const success = getChildren(this, Bucket)
                .filter(b => !b.isEmpty())
                .every(b => b.checkSuccess());
            if (success) {
                const confetti = new Confetti();
                this.append(confetti);
                this.undos.splice(0, Infinity);
                this.game.controls?.triggerUpdate();
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
            this.undos.push(async () => animate(movables, async () => {
                movables.forEach(m => src.prepend(m));
            }));
            return animate(movables, async () => {
                movables.forEach(m => dest.prepend(m));
            });
        }
        async undo() {
            const fn = this.undos.pop();
            if (fn) {
                await fn();
                this.deselect();
                this.game.triggerUpdate();
            }
        }
        triggerUpdate() {
            getChildren(this, Bucket).forEach(b => b.triggerUpdate());
            this.checkSuccess();
        }
    }

    class ConfigPanel extends HTMLElement {
        game;
        constructor(game) {
            super();
            this.game = game;
            this.hide();
        }
        show() {
            this.classList.remove('hide');
        }
        hide() {
            this.classList.add('hide');
        }
        connectedCallback() {
            const wrap = document.createElement('div');
            wrap.classList.add('config-wrap');
            // emojis [5 - ?]
            wrap.append(createRange({
                label: 'Emoji Count',
                min: 5,
                max: this.game.config.emojiCandidates.length,
                value: this.game.config.emojiCount,
                handler: n => {
                    this.game.config.emojiCount = n;
                    this.game.resetGame();
                }
            }));
            // spares [1-4]
            wrap.append(createRange({
                label: 'Spare Buckets',
                min: 1,
                max: 4,
                value: this.game.config.emptyCount,
                handler: n => {
                    this.game.config.emptyCount = n;
                    this.game.resetGame();
                }
            }));
            // height [4 - 6]
            wrap.append(createRange({
                label: 'Bucket Height',
                min: 3,
                max: 6,
                value: this.game.config.bucketHeight,
                handler: n => {
                    this.game.config.bucketHeight = n;
                    this.game.resetGame();
                }
            }));
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '⬇️ Close';
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
            wrap.append(closeBtn);
            this.append(wrap);
        }
    }

    class Game extends HTMLElement {
        config;
        controls;
        manager;
        configPanel;
        constructor(config) {
            super();
            this.config = config;
        }
        connectedCallback() {
            this.controls = new Controls(this);
            this.append(this.controls);
            this.manager = new BucketManager(this);
            this.append(this.manager);
            this.configPanel = new ConfigPanel(this);
            this.append(this.configPanel);
            this.resetGame();
            this.triggerUpdate();
        }
        triggerUpdate() {
            this.controls?.triggerUpdate();
            this.manager?.triggerUpdate();
        }
        resetGame() {
            this.manager?.resetBuckets();
            this.triggerUpdate();
        }
    }

    customElements.define('emoji-game', Game);
    customElements.define('emoji-game-config', ConfigPanel);
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
