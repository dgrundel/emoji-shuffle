export const doTimes = (n: number, fn: (n: number) => void) => {
    for (let i = 0; i < n; i++) {
        fn(i);
    }
};

export const takeRandom = <T>(items: T[]): T => {
    const i = Math.floor(Math.random() * items.length);
    const item = items[i];
    items.splice(i, 1);
    return item;
};

export const getChildren = <T>(parent: Node, type: new (...args: any[]) => T): T[] => {
    return [...parent.childNodes].filter((el: any): el is T => el instanceof type) as T[];
};

export const clearChildren = (node: Node) => {
    while (node.firstChild) {
        node.removeChild(node.lastChild!);
    }
};

export function getNumberFromLocalStorage(key: string): number | undefined;
export function getNumberFromLocalStorage(key: string, fallback: number): number;
export function getNumberFromLocalStorage(key: string, fallback?: number): number | undefined {
    const str = localStorage.getItem(key);
    if (!str) {
        return fallback;
    }
    const parsed = parseInt(str);
    if (isNaN(parsed)) {
        return fallback;
    }
    return parsed;
}

export interface AnimatedAction {
    nodes: HTMLElement[];
    domChange: () => Promise<void>;
}

const getNodeAnimationDuration = (n: HTMLElement): number => {
    if ('transitionDurationMs' in n) {
        if (typeof n.transitionDurationMs === 'number') {
            return n.transitionDurationMs;
        }
        console.error('node.transitionDurationMs was not a number');
    }
    console.error('node did not contain a valid transitionDurationMs attribute');
    return 100;
}

export const animate = async (action: AnimatedAction): Promise<void> => {
    const { nodes, domChange: fn } = action;

    let maxDuration = 0;
    nodes.forEach(n => {
        const duration = getNodeAnimationDuration(n);
        maxDuration = Math.max(duration, maxDuration);
        n.dataset.prevTransform = n.style.transform;
        n.style.transform = 'scale(0.0)';
    });
    await new Promise(r => setTimeout(r, maxDuration));
    await fn();
    await new Promise(r => setTimeout(r, maxDuration));
    nodes.forEach(n => {
        n.style.transform = n.dataset.prevTransform || '';
        n.dataset.prevTransform = undefined;
    });
};

const shakeDurationMs = 200;
export const shake = async (nodes: HTMLElement[]) => {
    const promises = nodes.map(node => new Promise<void>(resolve => {
        node.classList.add('shake');
        setTimeout(() => {
            node.classList.remove('shake');
            resolve();
        }, shakeDurationMs);
    }));
    return Promise.all(promises);
}

export interface CreateRangeOpts {
    label: string;
    min: number;
    max: number;
    value: number;
    handler: (n: number) => void;
}

export const createRange = (opts: CreateRangeOpts): HTMLElement => {
    const text = document.createElement('span');
    text.classList.add('range-text');
    text.textContent = opts.label;
    
    const display = document.createElement('span');
    display.classList.add('range-display');
    display.textContent = `${opts.value}`;
    
    const input = document.createElement('input');
    input.type = 'range';
    input.min = `${opts.min}`;
    input.max = `${opts.max}`;
    input.step = '1';
    input.value = `${opts.value}`;
    input.addEventListener('input', () => {
        const value = parseInt(input.value);
        opts.handler(value);
        display.textContent = `${value}`;
    });
    
    const label = document.createElement('label');
    label.classList.add('range-label');
    label.append(text);
    label.append(input);
    label.append(display);
    return label;
};

export interface CreateCheckboxOpts {
    label: string;
    checked: boolean;
    handler: (checked: boolean) => void;
}

export const createCheckbox = (opts: CreateCheckboxOpts): HTMLElement => {
    const text = document.createElement('span');
    // text.classList.add('checkbox-text');
    text.textContent = opts.label;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = opts.checked;
    input.addEventListener('click', () => opts.handler(input.checked));
    
    const label = document.createElement('label');
    label.classList.add('checkbox-label');
    label.append(input);
    label.append(text);
    return label;
};

export interface DomStruct {
    name: string;
    ref?: string;
    textContent?: string;
    classes?: string[];
    attrs?: Record<string, string>;
    children?: DomStruct[];
}

export interface CreatedDom {
    root: HTMLElement;
    refs: Record<string, HTMLElement>;
}

export const createDom = (dom: DomStruct): CreatedDom => {
    const root = document.createElement(dom.name);
    const refs: Record<string, HTMLElement> = {};

    if (dom.ref) {
        refs[dom.ref] = root;
    }
    if (dom.textContent) {
        root.textContent = dom.textContent
    }
    if (dom.classes) {
        root.classList.add(...dom.classes);
    }
    if (dom.attrs) {
        Object.assign(root, dom.attrs);
    }

    dom.children?.map(c => createDom(c))
        .forEach(child => {
            root.append(child.root);
            Object.assign(refs, child.refs);
        });

    return {root, refs};
};