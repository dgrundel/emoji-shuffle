enum Sound {
    Pop1 = 'pop1.wav',
    Pop2 = 'pop2.wav',
    Pop3 = 'pop3.wav',
    Pop4 = 'pop4.wav',
    Pop5 = 'pop5.wav',
    Pop6 = 'pop6.wav',
    Tada = 'tada.wav',
    Click = 'click.wav',
    AltClick = 'alt-click.wav',
}

const pops = [
    Sound.Pop1,
    Sound.Pop2,
    Sound.Pop3,
    Sound.Pop4,
    Sound.Pop5,
    Sound.Pop6,
];

export class SoundController {
    private cache: Partial<Record<Sound, HTMLAudioElement>> = {};
    enabled: boolean = true;

    private getAudio(src: Sound): HTMLAudioElement {
        if (!this.cache[src]) {
            this.cache[src] = new Audio(src);
        }

        return this.cache[src];
    }

    private play(sound: Sound, volume: number = 1.0) {
        if (!this.enabled) {
            return;
        }
        const a = this.getAudio(sound);
        a.volume = volume;
        a.play();
    }

    pop() {
        const i = Math.floor(Math.random() * pops.length);
        this.play(pops[i], 0.4);
    }

    fanfare() {
        this.play(Sound.Tada, 0.4);
    }

    click() {
        this.play(Sound.Click, 0.8);
    }

    altClick() {
        this.play(Sound.AltClick);
    }
}