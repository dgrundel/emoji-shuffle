const pops = [
    'pop1.wav',
    'pop2.wav',
    'pop3.wav',
    'pop4.wav',
    'pop5.wav',
    'pop6.wav',
];

export class SoundController {
    private cache: Record<string, HTMLAudioElement> = {};
    enabled: boolean = true;

    private getAudio(src: string): HTMLAudioElement {
        if (!this.cache[src]) {
            this.cache[src] = new Audio(src);
        }

        return this.cache[src];
    }

    private play(src: string, volume: number = 1.0) {
        if (!this.enabled) {
            return;
        }
        const a = this.getAudio(src);
        a.volume = volume;
        a.play();
    }

    pop() {
        const i = Math.floor(Math.random() * pops.length);
        this.play(pops[i], 0.45);
    }

    fanfare() {
        this.play('tada.wav', 0.6);
    }

    click() {
        this.play('click.wav', 0.8);
    }

    altClick() {
        this.play('alt-click.wav');
    }
}