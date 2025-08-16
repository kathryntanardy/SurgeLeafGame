import { itemKeys as Items } from '$lib/game/bucketData';

// Local declaration to satisfy TS when using Svelte runes in class fields
// In Svelte 5, $state returns a reactive value of the same type
declare function $state<T>(initial: T): T;

export type Order = Record<string, number>;

export class LeafGame {
    queuedOrders = $state<Order[]>([]);
    currentOrder = $state<Order>({});
    score = $state<number>(0);

    someVar = 123;

    constructor() {
        this.addOrder();
        setInterval(() => {
            this.addOrder();
        }, 10000);
    }

    addOrder(): void {
        if (this.queuedOrders.length > 5) return;

        const order: Order = {};
        for (let i = 0; i < 10; i++) {
            if (Math.random() > 0.5) {
                const item = this.randItem(Items);
                order[item] = (order[item] ?? 0) + 1;
            }
        }
        this.queuedOrders.push(order);
    }

    makeItem(item: string): void {
        this.currentOrder[item] = (this.currentOrder[item] ?? 0) + 1;
    }

    submitOrder(): void {
        if (this.queuedOrders.length === 0) return;

        const target = this.queuedOrders.at(0)!;
        this.queuedOrders.splice(0, 1);

        for (const [key, val] of Object.entries(this.currentOrder)) {
            if (key in target) {
                this.score += Math.min(val as number, target[key]!);
            }
        }
        this.currentOrder = {};
    }

    randItem<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
