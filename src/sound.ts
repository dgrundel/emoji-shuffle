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

    private play(src: string) {
        if (!this.enabled) {
            return;
        }
        const a = this.getAudio(src);
        a.play();
    }

    pop() {
        const i = Math.floor(Math.random() * pops.length);
        this.play(pops[i]);
    }

    fanfare() {
        this.play('tada.wav');
    }
}