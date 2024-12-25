export class Bubble extends HTMLElement {    
    private static selectedClass = 'selected';

    constructor(label: string) {
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