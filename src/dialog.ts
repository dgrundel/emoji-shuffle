import { Game } from "./game";
import { createDom, DomStruct } from "./utils";


export class Dialog extends HTMLElement {
    // should match largest animation delay on dialog element
    static animationDelay = 200;

    connectedPromise: Promise<Dialog>;
    connectedResolver?: (d: Dialog) => void;
    pendingActions: (() => void)[] = [];
    wrap: HTMLElement
    
    constructor() {
        super();

        this.classList.add('collapsible');
        this.hide();

        this.connectedPromise = new Promise(resolve => this.connectedResolver = resolve);

        this.wrap = this.applyWrap();
    }

    applyWrap() {
        const wrap = document.createElement('div');
        wrap.classList.add('dialog-wrap');
        this.append(wrap);
        this.append = (...nodes: (Node | string)[]) => {
            this.wrap.append(...nodes);
        }
        return wrap;
    }

    connectedCallback() {
        this.connectedResolver!(this);
    }

    onConnect(fn: (d: Dialog) => any) {
        this.connectedPromise.then(fn);
    }

    show() {
        this.classList.remove('collapsed');
    }

    hide() {
        this.classList.add('collapsed');
    }

    destroy() {
        this.hide();
        setTimeout(() => this.parentElement?.removeChild(this), Dialog.animationDelay);
    }
}


export interface SimpleDialogConfig {
    game: Game,
    content: DomStruct,
    buttons?: {
        textContent: string,
        handler: () => boolean | undefined,
    }[],
    destroy?: boolean,
}

export const simpleDialog = (config: SimpleDialogConfig): Dialog => {
    const sound = config.game.soundController;
    const dialog = new Dialog();

    const buttons = config.buttons && config.buttons.length > 0
        ? config.buttons
        : [{
            textContent: '⬇️ Close',
            handler: () => true,
        }]

    const { root, refs } = createDom({
        classes: ['flex-col'],
        children: [ config.content, {
            classes: ['flex-row'],
            children: buttons.map((b, i) => ({
                name: 'button',
                textContent: b.textContent,
                ref: `button-${i}`,
            })),
        }]
    });

    // refs.content.append(config.content);

    buttons.forEach((b, i) => {
        const el = refs[`button-${i}`];
        el.addEventListener('click', () => {
            sound.altClick();
            const hide = b.handler();
            if (hide !== false) {
                if (config.destroy === true) {
                    dialog.destroy();
                } else {
                    dialog.hide();
                }
            }
        });
    });

    dialog.append(root);
    return dialog;
};
