

export class Dialog extends HTMLElement {
    wrap: HTMLElement
    
    constructor() {
        super();
        this.hide();
        this.wrap = document.createElement('div');
        this.wrap.classList.add('dialog-wrap');
        this.append(this.wrap);
        this.append = (...nodes: (Node | string)[]) => {
            this.wrap.append(...nodes);
        }
    }

    show() {
        this.classList.remove('hide');
    }

    hide() {
        this.classList.add('hide');
    }
}