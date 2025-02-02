

export class Dialog extends HTMLElement {
    wrap: HTMLElement
    
    constructor() {
        super();

        this.classList.add('collapsible');
        this.hide();

        this.wrap = document.createElement('div');
        this.wrap.classList.add('dialog-wrap');
        this.append(this.wrap);
        this.append = (...nodes: (Node | string)[]) => {
            this.wrap.append(...nodes);
        }
    }

    show() {
        this.classList.remove('collapsed');
    }

    hide() {
        this.classList.add('collapsed');
    }
}