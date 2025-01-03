export class Bubble extends HTMLElement {    
    private static selectedClass = 'selected';
    transitionDurationMs = 50;
    emoji: string;

    constructor(emoji: string) {
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