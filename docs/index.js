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
    const getNodeAnimationDuration = (n) => {
        if ('transitionDurationMs' in n) {
            if (typeof n.transitionDurationMs === 'number') {
                return n.transitionDurationMs;
            }
            console.error('node.transitionDurationMs was not a number');
        }
        console.error('node did not contain a valid transitionDurationMs attribute');
        return 100;
    };
    const animate = async (action) => {
        const { nodes, domChange: fn } = action;
        let maxDuration = 0;
        nodes.forEach(n => {
            const duration = getNodeAnimationDuration(n);
            maxDuration = Math.max(duration, maxDuration);
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
    const shakeDurationMs = 200;
    const shake = async (nodes) => {
        const promises = nodes.map(node => new Promise(resolve => {
            node.classList.add('shake');
            setTimeout(() => {
                node.classList.remove('shake');
                resolve();
            }, shakeDurationMs);
        }));
        return Promise.all(promises);
    };
    const createRange = (opts) => {
        const dom = createDom({
            name: 'label',
            classes: ['range-label'],
            children: [{
                    name: 'span',
                    classes: ['range-text'],
                    textContent: opts.label,
                }, {
                    name: 'input',
                    ref: 'input',
                    attrs: {
                        type: 'range',
                        min: `${opts.min}`,
                        max: `${opts.max}`,
                        step: '1',
                        value: `${opts.value}`,
                    }
                }, {
                    name: 'span',
                    ref: 'display',
                    classes: ['range-display'],
                    textContent: `${opts.value}`
                }]
        });
        const input = dom.refs.input;
        const display = dom.refs.display;
        input.addEventListener('input', () => {
            const value = parseInt(input.value);
            opts.handler(value);
            display.textContent = `${value}`;
        });
        return dom.root;
    };
    const createCheckbox = (opts) => {
        const dom = createDom({
            name: 'label',
            classes: ['checkbox-label'],
            children: [{
                    name: 'input',
                    ref: 'input',
                    attrs: {
                        type: 'checkbox',
                        checked: opts.checked
                    }
                }, {
                    name: 'span',
                    textContent: opts.label,
                }]
        });
        const input = dom.refs.input;
        input.addEventListener('click', () => opts.handler(input.checked));
        return dom.root;
    };
    const createDom = (dom) => {
        const root = document.createElement(dom.name);
        const refs = {};
        if (dom.ref) {
            refs[dom.ref] = root;
        }
        if (dom.textContent) {
            root.textContent = dom.textContent;
        }
        if (dom.classes) {
            root.classList.add(...dom.classes);
        }
        if (dom.attrs) {
            Object.assign(root, dom.attrs);
        }
        dom.children?.map(c => createDom(c))
            .forEach(child => {
            root.append(child.root);
            Object.assign(refs, child.refs);
        });
        return { root, refs };
    };
    const zeroPad = (n, digits) => {
        // ('00'+n).slice(-2);
        const str = n.toFixed(0);
        if (str.length >= digits) {
            return str;
        }
        return (new Array(digits).fill('0').join('') + str).slice(-1 * digits);
    };

    class Bubble extends HTMLElement {
        static selectedClass = 'selected';
        transitionDurationMs = 50;
        emoji;
        constructor(emoji) {
            super();
            this.emoji = emoji;
            this.dataset.emoji = emoji;
            this.style.setProperty('--transition-duration', `${this.transitionDurationMs}ms`);
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
            this.manager.game.dispatcher.onMoved(this.onMoved.bind(this));
        }
        put(b) {
            this.prepend(b);
        }
        onClick(e) {
            if (this.manager.hasSelection()) {
                this.manager.tryMoveTo(this).then(() => {
                    this.manager.deselect();
                });
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
            if (!first) {
                return;
            }
            first.select();
            for (let i = 0; i < bubbles.length; i++) {
                if (bubbles[i].emoji !== first.emoji) {
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
            const success = bubbles.every(b => b.emoji === first?.emoji);
            this.classList.toggle(Bucket.successClass, success);
            return success;
        }
        onMoved() {
            this.checkSuccess();
        }
    }

    class Controls extends HTMLElement {
        game;
        undoBtn;
        newBtn;
        resetBtn;
        constructor(game) {
            super();
            this.game = game;
        }
        updateUI() {
            if (this.undoBtn) {
                this.undoBtn.disabled = this.game.manager?.undos.length === 0;
            }
            if (this.resetBtn) {
                this.resetBtn.disabled = this.game.manager?.undos.length === 0;
            }
        }
        connectedCallback() {
            this.game.dispatcher.onMoved(this.updateUI.bind(this));
            this.game.dispatcher.onWon(this.updateUI.bind(this));
            this.createDom();
            this.updateUI();
        }
        createDom() {
            this.undoBtn = document.createElement('button');
            this.undoBtn.textContent = '↩️ Undo';
            this.undoBtn.addEventListener('click', () => {
                this.game.soundController.altClick();
                this.game.manager?.undo();
            });
            this.append(this.undoBtn);
            this.resetBtn = document.createElement('button');
            this.resetBtn.textContent = '🔄 Reset';
            this.resetBtn.addEventListener('click', () => {
                this.game.soundController.altClick();
                this.game.resetGame();
            });
            this.append(this.resetBtn);
            this.newBtn = document.createElement('button');
            this.newBtn.textContent = '⏩ New';
            this.newBtn.addEventListener('click', () => {
                this.game.soundController.altClick();
                this.game.newGame();
            });
            this.append(this.newBtn);
            const configBtn = document.createElement('button');
            configBtn.textContent = '⚙️';
            configBtn.addEventListener('click', () => {
                this.game.soundController.click();
                this.game.configPanel?.show();
            });
            this.append(configBtn);
        }
    }

    var GameEvent;
    (function (GameEvent) {
        GameEvent["NewGame"] = "game-events:new-game";
        GameEvent["Moved"] = "game-events:moved";
        GameEvent["Won"] = "game-events:won";
    })(GameEvent || (GameEvent = {}));
    var MoveType;
    (function (MoveType) {
        MoveType[MoveType["Move"] = 0] = "Move";
        MoveType[MoveType["Undo"] = 1] = "Undo";
        MoveType[MoveType["Reset"] = 2] = "Reset";
    })(MoveType || (MoveType = {}));
    class Dispatcher {
        target;
        constructor(target) {
            this.target = target;
        }
        newGame() {
            this.target.dispatchEvent(new CustomEvent(GameEvent.NewGame));
        }
        onNewGame(fn) {
            this.target.addEventListener(GameEvent.NewGame, fn);
        }
        moved(moveType) {
            this.target.dispatchEvent(new CustomEvent(GameEvent.Moved, {
                detail: { moveType }
            }));
        }
        onMoved(fn) {
            this.target.addEventListener(GameEvent.Moved, e => {
                const moveType = e.detail.moveType;
                if (typeof moveType === 'undefined') {
                    console.error('Missing MoveType, got: ', moveType, e);
                }
                fn(moveType);
            });
        }
        won() {
            this.target.dispatchEvent(new CustomEvent(GameEvent.Won));
        }
        onWon(fn) {
            this.target.addEventListener(GameEvent.Won, fn);
        }
    }

    class BucketManager extends HTMLElement {
        static emojiCandidates = [
            '🔥', '🙌', '💯', '😱',
            '🍪', '💖', '🍕', '🎁',
            '💀', '✨', '🎉', '👀',
            '🚀', '😍', '💎', '⭐',
            '🫐', '🍿', '🥤', '🌮',
            '🥞', '🐥', '🎸', '💃',
        ];
        game;
        config;
        undos = [];
        constructor(game) {
            super();
            this.game = game;
            this.config = game.config;
        }
        connectedCallback() {
            this.game.dispatcher.onMoved(this.onMoved.bind(this));
            this.regenerate();
        }
        async regenerate() {
            clearChildren(this);
            this.setStyleProps();
            this.undos = [];
            this.generateBuckets();
            this.game.dispatcher.newGame();
        }
        setStyleProps() {
            this.style.setProperty('--bucket-count', `${this.config.emojiCount + this.config.emptyCount}`);
            this.style.setProperty('--bucket-height', `${this.config.bucketHeight}`);
        }
        generateBuckets() {
            const emojiCandidates = BucketManager.emojiCandidates.slice();
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
                this.won();
            }
        }
        won() {
            this.undos.splice(0, Infinity);
            this.deselect();
            this.game.dispatcher.won();
        }
        hasAvailableMoves() {
            const buckets = getChildren(this, Bucket);
            const srcs = [];
            const dests = [];
            for (let b = 0; b < buckets.length; b++) {
                const bucket = buckets[b];
                const bubbles = getChildren(bucket, Bubble);
                if (bubbles.length === 0) {
                    console.log('found empty bucket');
                    return true;
                }
                if (bubbles.length > 0) {
                    srcs.push(bucket);
                }
                if (bubbles.length < this.game.config.bucketHeight) {
                    dests.push(bucket);
                }
            }
            for (let i = 0; i < srcs.length; i++) {
                const src = srcs[i];
                const srcBubble = getChildren(src, Bubble)[0];
                for (let j = 0; j < dests.length; j++) {
                    const dest = dests[j];
                    if (src === dest) {
                        continue;
                    }
                    const destBubble = getChildren(dest, Bubble)[0];
                    if (srcBubble.emoji === destBubble.emoji) {
                        console.log('src', src);
                        console.log('dest', dest);
                        return true;
                    }
                }
            }
            return false;
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
            // no op
            if (src === dest) {
                return;
            }
            const existing = getChildren(dest, Bubble);
            if (existing.length !== 0 && existing[0].emoji !== selected[0].emoji) {
                return shake([src]);
            }
            const available = this.config.bucketHeight - existing.length;
            const moves = Math.min(available, selected.length);
            if (moves === 0) {
                return shake([dest]);
            }
            const movables = selected.slice(0, moves);
            this.undos.push({
                nodes: movables,
                domChange: async () => {
                    movables.forEach(m => src.prepend(m));
                }
            });
            return animate({
                nodes: movables,
                domChange: async () => {
                    movables.forEach(m => dest.prepend(m));
                }
            }).then(() => {
                this.game.soundController.pop();
                this.game.dispatcher.moved(MoveType.Move);
            });
        }
        async undo() {
            const action = this.undos.pop();
            if (action) {
                await animate(action);
                this.deselect();
                this.game.dispatcher.moved(MoveType.Undo);
            }
        }
        async reset() {
            if (this.undos.length === 0) {
                return;
            }
            // empty the list of undos and get a 
            // copy of all the moves we need to perform
            // reverse the list so we perform the undo 
            // actions in the correct (reverse) order
            const actions = this.undos.splice(0).reverse();
            const nodes = actions.reduce((nodeSet, action) => {
                action.nodes.forEach(n => nodeSet.add(n));
                return nodeSet;
            }, new Set());
            const domChange = async () => {
                return actions.reduce((promise, action) => {
                    return promise.then(() => action.domChange());
                }, Promise.resolve());
            };
            await animate({
                nodes: [...nodes],
                domChange,
            });
            // this.game.soundController.pop();
            this.game.dispatcher.moved(MoveType.Reset);
        }
        onMoved() {
            this.checkSuccess();
        }
    }

    class Dialog extends HTMLElement {
        wrap;
        constructor() {
            super();
            this.hide();
            this.wrap = document.createElement('div');
            this.wrap.classList.add('dialog-wrap');
            this.append(this.wrap);
            this.append = (...nodes) => {
                this.wrap.append(...nodes);
            };
        }
        show() {
            this.classList.remove('hide');
        }
        hide() {
            this.classList.add('hide');
        }
    }

    class ConfigPanel extends HTMLElement {
        game;
        dialog;
        constructor(game) {
            super();
            this.game = game;
            this.hide();
        }
        show() {
            this.dialog?.show();
        }
        hide() {
            this.dialog?.hide();
        }
        connectedCallback() {
            const dialog = new Dialog();
            this.dialog = dialog;
            this.append(dialog);
            // emojis [5 - ?]
            dialog.append(createRange({
                label: 'Emoji Count',
                min: 5,
                max: BucketManager.emojiCandidates.length,
                value: this.game.config.emojiCount,
                handler: n => {
                    this.game.soundController.altClick();
                    this.game.config.emojiCount = n;
                    this.game.newGame();
                }
            }));
            // spares [1-4]
            dialog.append(createRange({
                label: 'Spare Buckets',
                min: 1,
                max: 4,
                value: this.game.config.emptyCount,
                handler: n => {
                    this.game.soundController.altClick();
                    this.game.config.emptyCount = n;
                    this.game.newGame();
                }
            }));
            // height [4 - 6]
            dialog.append(createRange({
                label: 'Bucket Height',
                min: 3,
                max: 6,
                value: this.game.config.bucketHeight,
                handler: n => {
                    this.game.soundController.altClick();
                    this.game.config.bucketHeight = n;
                    this.game.newGame();
                }
            }));
            dialog.append(createCheckbox({
                label: 'Sound effects',
                checked: this.game.config.soundEnabled,
                handler: checked => {
                    this.game.config.soundEnabled = checked;
                    this.game.soundController.click();
                }
            }));
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '⬇️ Close';
            closeBtn.addEventListener('click', () => {
                this.game.soundController.altClick();
                this.hide();
            });
            dialog.append(closeBtn);
        }
    }

    var Sound;
    (function (Sound) {
        Sound["Pop1"] = "pop1.wav";
        Sound["Pop2"] = "pop2.wav";
        Sound["Pop3"] = "pop3.wav";
        Sound["Pop4"] = "pop4.wav";
        Sound["Pop5"] = "pop5.wav";
        Sound["Pop6"] = "pop6.wav";
        // Tada = 'tada.wav',
        Sound["Win"] = "win.wav";
        Sound["Click"] = "click.wav";
        Sound["AltClick"] = "alt-click.wav";
    })(Sound || (Sound = {}));
    const pops = [
        Sound.Pop1,
        Sound.Pop2,
        Sound.Pop3,
        Sound.Pop4,
        Sound.Pop5,
        Sound.Pop6,
    ];
    class SoundController {
        cache = {};
        game;
        constructor(game) {
            this.game = game;
            this.preload();
        }
        preload() {
            Object.values(Sound).forEach(s => this.getAudio(s));
        }
        getAudio(src) {
            if (!this.cache[src]) {
                this.cache[src] = new Audio(src);
            }
            return this.cache[src];
        }
        play(sound, volume = 1.0) {
            if (!this.game.config.soundEnabled) {
                return;
            }
            const a = this.getAudio(sound);
            a.volume = volume;
            a.play();
        }
        pop() {
            const i = Math.floor(Math.random() * pops.length);
            this.play(pops[i], 0.3);
        }
        fanfare() {
            this.play(Sound.Win, 0.9);
        }
        click() {
            this.play(Sound.Click, 0.8);
        }
        altClick() {
            this.play(Sound.AltClick);
        }
    }

    const persist = (t, storageKey) => {
        const json = localStorage.getItem(storageKey);
        const values = Object.assign({}, t);
        if (json) {
            try {
                const stored = JSON.parse(json);
                Object.assign(values, stored);
            }
            catch (e) {
                console.error(`error parsing json for "${storageKey}"`, e);
            }
        }
        const result = {};
        Object.keys(values).forEach(key => {
            Object.defineProperty(result, key, {
                get() {
                    return values[key];
                },
                set(newValue) {
                    values[key] = newValue;
                    localStorage.setItem(storageKey, JSON.stringify(values));
                },
                enumerable: true,
                configurable: true,
            });
        });
        return result;
    };

    const stats = persist({
        bestStreak: 0,
        bestTime: 0,
    }, 'game-stats');

    class StatusBar extends HTMLElement {
        game;
        currentStreak = 0;
        currentStreakDisplay;
        bestStreakDisplay;
        prevWin = false;
        constructor(game) {
            super();
            this.game = game;
        }
        connectedCallback() {
            this.game.dispatcher.onWon(this.onWon.bind(this));
            this.game.dispatcher.onNewGame(this.onNewGame.bind(this));
            const currDom = createDom({
                name: 'div',
                classes: ['status-item'],
                textContent: 'Current streak: ',
                children: [{
                        name: 'em',
                        ref: 'display'
                    }]
            });
            this.append(currDom.root);
            this.currentStreakDisplay = currDom.refs['display'];
            const best = createDom({
                name: 'div',
                classes: ['status-item'],
                textContent: 'Best streak: ',
                children: [{
                        name: 'em',
                        ref: 'display'
                    }]
            });
            this.append(best.root);
            this.bestStreakDisplay = best.refs['display'];
            this.updateUI();
        }
        incrementStreak() {
            this.currentStreak++;
            if (this.currentStreak > stats.bestStreak) {
                stats.bestStreak = this.currentStreak;
            }
        }
        // TODO: should use data binding to avoid this
        updateUI() {
            if (this.currentStreakDisplay) {
                this.currentStreakDisplay.textContent = this.currentStreak.toFixed(0);
            }
            if (this.bestStreakDisplay) {
                this.bestStreakDisplay.textContent = stats.bestStreak.toFixed(0);
            }
        }
        onWon() {
            this.prevWin = true;
            this.incrementStreak();
            this.updateUI();
        }
        onNewGame() {
            if (!this.prevWin) {
                this.currentStreak = 0;
                this.updateUI();
            }
            this.prevWin = false;
        }
    }

    const decimalPlaces = 2;
    class Timer {
        game;
        spans = [];
        lastStart = 0;
        constructor(game) {
            this.game = game;
            document.addEventListener("visibilitychange", this.update.bind(this));
            this.game.dispatcher.onNewGame(this.onNewGame.bind(this));
            this.game.dispatcher.onWon(this.onWon.bind(this));
        }
        onNewGame() {
            this.clear();
            this.start();
        }
        onWon() {
            this.stop();
        }
        update() {
            if (document.hidden) {
                this.stop();
            }
            else {
                this.start();
            }
        }
        isStarted() {
            return this.lastStart !== 0;
        }
        start() {
            if (this.isStarted()) {
                return;
            }
            this.lastStart = performance.now();
        }
        stop() {
            if (!this.isStarted()) {
                return;
            }
            const span = performance.now() - this.lastStart;
            this.spans.push(span);
            this.lastStart = 0;
        }
        elapsed() {
            const spanSum = this.spans.reduce((sum, n) => sum + n, 0);
            if (this.isStarted()) {
                const span = performance.now() - this.lastStart;
                return spanSum + span;
            }
            return spanSum;
        }
        static toHuman(t) {
            const decimals = (t / 1000).toFixed(decimalPlaces).split('.')[1];
            const sec = Math.floor(t / 1000);
            const min = Math.floor(sec / 60);
            const remSec = sec - (min * 60);
            return `${zeroPad(min, 2)}:${zeroPad(remSec, 2)}.${decimals}`;
        }
        clear() {
            this.spans.splice(0);
            this.lastStart = 0;
        }
    }

    class Banner extends HTMLElement {
        title;
        subtitle;
        constructor(title, subtitle) {
            super();
            this.title = title;
            this.subtitle = subtitle;
        }
        connectedCallback() {
            const { root } = createDom({
                name: 'div',
                classes: ['banner-content'],
                children: [{
                        name: 'div',
                        textContent: this.title,
                    }, {
                        name: 'div',
                        classes: ['banner-subtitle'],
                        textContent: this.subtitle,
                    }]
            });
            this.append(root);
        }
        disconnectedCallback() {
            this.innerHTML = '';
        }
    }

    const messages = [
        "Ace moves!",
        "Amazing work!",
        "Brilliant win!",
        "Champion!",
        "Crushed it!",
        "Epic!",
        "Fantastic!",
        "Legendary!",
        "Like a boss!",
        "Magnificent!",
        "Nice job!",
        "Nailed it!",
        "Outstanding!",
        "Success!",
        "Superstar!",
        "Top notch!",
        "Unstoppable!",
        "Victory!",
        "Well done!",
        "Winner winner!",
        "You did it!",
        "You rock!",
        "You're a star!",
        "You won!",
    ];
    class Victory extends HTMLElement {
        game;
        constructor(game) {
            super();
            this.game = game;
        }
        connectedCallback() {
            const title = takeRandom(messages.slice());
            const t = this.game.timer.elapsed();
            let message = `⏱️ ${Timer.toHuman(t)}`;
            if (t < stats.bestTime || stats.bestTime === 0) {
                stats.bestTime = t;
                message += ` ⚡ New best!`;
            }
            else {
                message += ` ⚡ Best: ${Timer.toHuman(stats.bestTime)}`;
            }
            this.append(new Confetti());
            this.append(new Banner(title, message));
            this.game.soundController.fanfare();
        }
    }

    class Game extends HTMLElement {
        config;
        dispatcher;
        soundController;
        timer;
        statusBar;
        controls;
        manager;
        configPanel;
        won = false;
        constructor(config) {
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
            this.dispatcher.onWon(this.onWon.bind(this));
            this.append(this.statusBar);
            this.append(this.controls);
            this.append(this.manager);
            this.append(this.configPanel);
            this.resetGame();
        }
        onWon() {
            this.append(new Victory(this));
        }
        async resetGame() {
            await this.manager?.reset();
        }
        async newGame() {
            getChildren(this, Victory).forEach(c => c.parentNode?.removeChild(c));
            await this.manager?.regenerate();
        }
    }

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
    const gameConfig = persist({
        emojiCount: 7,
        emptyCount: 2,
        bucketHeight: 4,
        soundEnabled: true,
    }, 'game-config');
    const game = new Game(gameConfig);
    document.getElementById('root').append(game);

})();
