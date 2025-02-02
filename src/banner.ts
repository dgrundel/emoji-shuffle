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
            classes: ['banner-content'],
            children: [{
                textContent: this.title,
            },{
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