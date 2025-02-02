import { Game } from "./game";
import { createDom, DomStruct } from "./utils";


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


export interface SimpleDialogConfig {
    game: Game,
    content: DomStruct,
    buttons?: {
        textContent: string,
        handler: () => boolean | undefined,
    }[],
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
        name: 'div',
        classes: ['flex-col'],
        children: [ config.content, {
            name: 'div',
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
                dialog.hide();
            }
        });
    });

    dialog.append(root);
    return dialog;
};
