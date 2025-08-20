import { writable, get } from 'svelte/store';
import { plantData } from '$lib/game/plantData';

export type Order = Record<string, number>;
export const scoreStore = writable(0);
export const queuedOrdersStore = writable<Order[]>([]);
export const currentOrderStore = writable<Order>({});

export class LeafGame {
    constructor() {
        this.addOrder();
        setInterval(() => this.addOrder(), 10000);
    }

    addOrder(): void {
        const q = get(queuedOrdersStore);
        if (q.length > 3) return;

        const Items = plantData.map(p => p.key);
        const order: Order = {};
        for (let i = 0; i < 10; i++) {
            if (Math.random() > 0.5) {
                const item = Items[Math.floor(Math.random() * Items.length)];
                order[item] = (order[item] ?? 0) + 1;
            }
        }
        queuedOrdersStore.update(arr => [...arr, order]);
    }

    makeItem(item: string): void {
        currentOrderStore.update(co => ({ ...co, [item]: (co[item] ?? 0) + 1 }));
    }

    submitOrder(): void {
        const q = get(queuedOrdersStore);
        if (q.length === 0) return;
        const [target, ...rest] = q;
        queuedOrdersStore.set(rest);

        const co = get(currentOrderStore);
        let gained = 0;
        for (const [key, val] of Object.entries(co)) {
            if (key in target) gained += Math.min(val as number, target[key]!);
        }
        scoreStore.update(s => s + gained);
        currentOrderStore.set({});
    }

    plantClick(key: string): void {
        const pts = plantData.find(p => p.key === key)?.points ?? 0;
        scoreStore.update(s => s + pts);
        this.makeItem(key);
    }
}
export const game = new LeafGame();
