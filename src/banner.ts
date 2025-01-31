import { createDom } from "./utils";

export class Banner extends HTMLElement {
    title: string
    subtitle?: string

    constructor(title: string, subtitle?: string) {
        super();
        this.title = title;
        this.subtitle = subtitle;
    }

    connectedCallback() {
        const { root } = createDom({
            name: 'div',
            classes: ['banner-content'],
            children: [{
                name: 'div',
                textContent: this.title,
            },{
                name: 'div',
                classes: ['banner-subtitle'],
                textContent: this.subtitle,
            }]
        });

        this.append(root);
    }

    disconnectedCallback() {
        this.innerHTML = '';
    }
}