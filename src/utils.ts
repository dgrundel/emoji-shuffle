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

export const animate = async (nodes: HTMLElement[], fn: () => Promise<void>): Promise<void> => {
    let maxDuration = 0;
    nodes.forEach(n => {
        const style = getComputedStyle(n);
        const duration = parseInt(style.getPropertyValue('--transition-duration'));
        if (!isNaN(duration)) {
            // assumining milliseconds
            maxDuration = Math.max(duration, maxDuration);
        }
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