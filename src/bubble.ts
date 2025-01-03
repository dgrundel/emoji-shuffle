export class Bubble extends HTMLElement {    
    private static selectedClass = 'selected';
    emoji: string;

    constructor(emoji: string) {
        super();
        this.emoji = emoji;
        this.dataset.emoji = emoji;
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