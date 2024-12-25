export const doTimes = (n: number, fn: (n: number) => void) => {
    for (let i = 0; i < n; i++) {
        fn(i);
    }
}

export const takeRandom = <T>(items: T[]): T => {
    const i = Math.floor(Math.random() * items.length);
    const item = items[i];
    items.splice(i, 1);
    return item;
}

export const getChildren = <T>(parent: Node, type: new (...args: any[]) => T): T[] => {
    return [...parent.childNodes].filter((el: any): el is T => el instanceof type) as T[];
}

export const clearChildren = (node: Node) => {
    while (node.firstChild) {
        node.removeChild(node.lastChild!);
    }
}

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
}