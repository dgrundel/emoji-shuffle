import { zeroPad } from "./utils";

const decimalPlaces = 2;

export class Timer {
    spans: number[] = [];
    lastStart = 0;

    constructor() {
        document.addEventListener("visibilitychange", this.update.bind(this));
    }

    update() {
        if (document.hidden) {
            this.stop();
        } else {
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

    static toHuman(t: number) {
        const decimals = (t/1000).toFixed(decimalPlaces).split('.')[1];
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