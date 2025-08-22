import { writable, get } from 'svelte/store';
import { plantData } from '$lib/game/plantData';


export type Order = Record<string, number>;
export const scoreStore = writable(0);
export const queuedOrdersStore = writable<Order[]>([]);
export const currentOrderStore = writable<Order>({});

// Stock: Availability of plants 
export enum Stock {
    Default = 'default',
    Available = 'available',
    OutOfStock = 'out_of_stock'
}

// State for plant information during runtime
export type plantInfo = {
    id: number;
    key: string;
    points: number;
    bucketKey: string;
    state: Stock;
};

// Initial Stocks definitions
const INITIAL_STATES: Record<string, Stock> = {
    bucket1: Stock.Default,
    bucket2: Stock.Default,
    bucket3: Stock.Available,
    bucket4: Stock.Available,
    bucket5: Stock.Default,
    bucket6: Stock.Default
};

export const plantArray = writable<Record<string, plantInfo>>(
    Object.fromEntries(
        plantData.map((p) => {
            const bucketKey = `bucket${p.id}`;
            const initialState = INITIAL_STATES[bucketKey] ?? Stock.Available;
            return [
                p.key,
                { id: p.id, key: p.key, points: p.points, bucketKey, state: initialState }
            ];
        })
    )
);

// Back-compat and canonical naming for components expecting plantsStore
export type PlantRuntime = plantInfo;
export const plantsStore = plantArray;

export class LeafGame {
    constructor() {
        this.addOrder();
        setInterval(() => {
            this.addOrder();
        }, 10000);
    }

    addOrder(): void {
        const q = get(queuedOrdersStore);
        if (q.length > 3) return;

        const Items = plantData.map((p) => p.key);
        const order: Order = {};
        for (let i = 0; i < 10; i++) {
            if (Math.random() > 0.5) {
                const item = Items[Math.floor(Math.random() * Items.length)];
                order[item] = (order[item] ?? 0) + 1;
            }
        }
        queuedOrdersStore.update((arr) => [...arr, order]);
    }

    makeItem(item: string): void {
        currentOrderStore.update((co) => ({ ...co, [item]: (co[item] ?? 0) + 1 }));
    }

    submitOrder(): void {
        const q = get(queuedOrdersStore);
        if (q.length === 0) return;
        const [target, ...rest] = q;
        queuedOrdersStore.set(rest);

        const co = get(currentOrderStore);
        let gained = 0;
        for (const [key, val] of Object.entries(co)) {
            if (key in target) {
                gained += Math.min(val as number, target[key]!);
            }
        }
        scoreStore.update((s) => s + gained);
        currentOrderStore.set({});
    }

    // Plant Click: Available -> Out of Stock
    plantClick(key: string): void {
        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.Available) return;
        scoreStore.update((s) => s + plant.points);
        // this.makeItem(key); 
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.OutOfStock } }));
        // Debug print
        const summary = Object.values(get(plantArray)).map((p) => ({ key: p.key, state: p.state }));
        console.log('Plant states after click:', summary);
    }

    // Restock: Out of Stock -> Available
    restockPlant(key: string): void {
        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.OutOfStock) return;
        // Plant 4 (Staff Stick) is free to restock
        if (plant.id !== 4) {
            const cost = plant.points;
            const currentScore = get(scoreStore);
            if (currentScore < cost) return;
            scoreStore.update((s) => s - cost);
        }
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.Available } }));
    }

    // Unlock: Default -> Available, cost = plant.points (plant 4 free)
    unlockPlant(key: string): void {
        const plant = get(plantArray)[key];
        if (!plant) return;
        if (plant.state !== Stock.Default) return;
        if (plant.id !== 4) {
            const cost = plant.points;
            const currentScore = get(scoreStore);
            if (currentScore < cost) return;
            scoreStore.update((s) => s - cost);
        }
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.Available } }));
    }
}

export const game = new LeafGame();
