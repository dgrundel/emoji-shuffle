import { createDom } from "./utils";

export class Banner extends HTMLElement {
    title: string

    constructor(title: string) {
        super();
        this.title = title;
    }

    connectedCallback() {
        const { root } = createDom({
            name: 'div',
            classes: ['banner-content'],
            children: [{
                name: 'div',
                textContent: this.title,
            }]
        });

        this.append(root);
    }

    disconnectedCallback() {
        this.innerHTML = '';
    }
}