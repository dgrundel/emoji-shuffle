import { getChildren } from './utils';
import { Bubble } from './bubble';
import { BucketManager } from './bucketManager';

export class Bucket extends HTMLElement {
    private static successClass = 'success';
    manager: BucketManager;

    constructor(manager: BucketManager) {
        super();
        this.manager = manager;
    }

    connectedCallback() {
        this.addEventListener('click', this.onClick.bind(this));
    }

    put(b: Bubble) {
        this.prepend(b);
    }

    onClick(e: MouseEvent) {
        if (this.manager.hasSelection()) {
            this.manager.tryMoveTo(this).then(() => {
                this.manager.deselect();
                this.manager.game.triggerUpdate();
            });
        } else {
            this.select();
            this.manager.game.triggerUpdate();
        }
    }

    select() {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length === 0) {
            return;
        }
        const first = bubbles.shift();
        first?.select();
        for (let i = 0; i < bubbles.length; i++) {
            if (bubbles[i].textContent !== first?.textContent) {
                break;
            }
            bubbles[i].select();
        }
    }

    deselect() {
        getChildren(this, Bubble).forEach(b => b.deselect());
    }
    
    hasSelection(): boolean {
        return getChildren(this, Bubble).some(b => b.isSelected());
    }

    isEmpty(): boolean {
        return getChildren(this, Bubble).length === 0;
    }

    checkSuccess(): boolean {
        const bubbles = getChildren(this, Bubble);
        if (bubbles.length !== this.manager.config.bucketHeight) {
            this.classList.remove(Bucket.successClass);
            return false;
        }
        const first = bubbles.shift();
        const success = bubbles.every(b => b.textContent === first?.textContent);
        this.classList.toggle(Bucket.successClass, success);
        return success;
    }

    triggerUpdate() {
        this.checkSuccess();
    }
}