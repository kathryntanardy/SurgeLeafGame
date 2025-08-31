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

// Order lifecycle for customers
export enum OrderStatus {
    InProgress = 'in_progress',
    Success = 'success',
    Fail = 'fail'
}

// Rich order entity per customer
export type OrderEntity = {
    id: number;                 // stable id
    requestedPlants: Order;     // required items (target)
    deliveredPlants: Order;     // delivered so far
    status: OrderStatus;        // in_progress | success | fail
    reward?: number;            // optional completion reward
};

export type OrderEntities = Record<number, OrderEntity>;

// Orders queued
export const orderEntities = writable<OrderEntities>({});
// Fixed display slots for up to 3 customers (holds order ids or null)
export const displaySlots = writable<(number | null)[]>([null, null, null]);
// Temp store for selected plant for delivery
export const tempSelectedPlant = writable<string | null>(null); // pending plant key

// (QTE removed)

// State for plant information during runtime
export type plantInfo = {
    id: number;
    key: string;
    points: number;
    bucketKey: string;
    state: Stock;
    stockCount: number; // remaining deliveries before OutOfStock (0 when not Available)
};

// Initial Stocks definitions
const INITIAL_STATES: Record<string, Stock> = {
    bucket1: Stock.Default,
    bucket2: Stock.Default,
    bucket3: Stock.Default,
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
                { id: p.id, key: p.key, points: p.points, bucketKey, state: initialState, stockCount: initialState === Stock.Available ? 1 : 0 }
            ];
        })
    )
);

// Back-compat and canonical naming for components expecting plantsStore
export type PlantRuntime = plantInfo;
export const plantsStore = plantArray;

// Mascot: frame state for Background rendering
export type MascotFrame = 'default1' | 'default2' | 'success';
export const mascotFrame = writable<MascotFrame>('default1');

export class LeafGame {
    private orderSeq: number = 1;
    private unlockedKeys: string[] = [];
    // Mascot internals
    private mascotTimerId: number | undefined = undefined;
    private mascotSuccessTimeoutId: number | undefined = undefined;

    constructor() {
        // Initialize unlocked keys from plants that are currently Available
        const plants = Object.values(get(plantArray));
        this.unlockedKeys = plants.filter((p) => p.state === Stock.Available).map((p) => p.key);

        this.addOrder();
        setInterval(() => {
            this.addOrder();
        }, 3000);

        // Start mascot idle animation (toggle frames while not in success)
        this.startMascotIdle();
    }

    addOrder(): void {
        // Require a free slot
        const slots = get(displaySlots);
        const freeIdx = slots.indexOf(null);
        if (freeIdx === -1) return;

        if (this.unlockedKeys.length === 0) return;

        const items: Order = {};
        for (let i = 0; i < 5; i++) {
            if (Math.random() > 0.5) {
                const item = this.unlockedKeys[Math.floor(Math.random() * this.unlockedKeys.length)];
                items[item] = (items[item] ?? 0) + 1;
            }
        }

        if (Object.keys(items).length === 0) return;

        const id = this.orderSeq++;
        const entity: OrderEntity = {
            id,
            requestedPlants: items,
            deliveredPlants: {},
            status: OrderStatus.InProgress,
        };

        // Register entity and place into the free slot
        orderEntities.update((m) => ({ ...m, [id]: entity }));
        displaySlots.update((s) => {
            const next = [...s];
            next[freeIdx] = id;
            return next;
        });
    }

    // Mascot API
    private startMascotIdle(): void {
        if (this.mascotTimerId) return;
        this.mascotTimerId = (setInterval(() => {
            let current: MascotFrame = get(mascotFrame);
            if (current === 'success') return; // don't toggle while celebrating
            mascotFrame.set(current === 'default1' ? 'default2' : 'default1');
        }, 700) as unknown) as number; // ~0.7s feels natural
    }

    private stopMascotIdle(): void {
        if (this.mascotTimerId) {
            clearInterval(this.mascotTimerId);
            this.mascotTimerId = undefined;
        }
    }

    private showMascotSuccessFor(ms: number = 2000): void {
        // Clear any previous success timeout
        if (this.mascotSuccessTimeoutId) {
            clearTimeout(this.mascotSuccessTimeoutId);
            this.mascotSuccessTimeoutId = undefined;
        }
        mascotFrame.set('success');
        // After a short celebration, return to default and idle continues
        this.mascotSuccessTimeoutId = (setTimeout(() => {
            mascotFrame.set('default1');
            this.mascotSuccessTimeoutId = undefined;
        }, ms) as unknown) as number;
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

    // Plant Click: select plant for pending delivery 
    plantClick(key: string): void {
        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.Available) return;
        tempSelectedPlant.set(key);
    }

    // (QTE removed)

    // Customer Click: deliver selected plant to a specific order
    deliverPlant(orderId: number): void {
        const key = get(tempSelectedPlant);
        if (!key) return;

        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.Available) return;

        orderEntities.update((all) => {
            const order = all[orderId];
            if (!order || order.status !== OrderStatus.InProgress) return all;

            const remaining = order.requestedPlants[key] ?? 0;
            if (remaining <= 0) return all; // not needed for this order

            // Move one unit from requested to delivered
            const newRequested = { ...order.requestedPlants } as Order;
            const newRemaining = remaining - 1;
            if (newRemaining > 0) newRequested[key] = newRemaining; else delete newRequested[key];

            const newDelivered = { ...order.deliveredPlants } as Order;
            newDelivered[key] = (newDelivered[key] ?? 0) + 1;

            const updated: OrderEntity = {
                ...order,
                requestedPlants: newRequested,
                deliveredPlants: newDelivered,
            };

            // Adjust score (QTE removed)
            scoreStore.update((s) => s + plant.points);
            // Decrement stock; if reaches 0, mark OutOfStock, else keep Available
            const nextCount = Math.max(0, (plant.stockCount ?? 0) - 1);
            const nextState = nextCount === 0 ? Stock.OutOfStock : Stock.Available;
            plantArray.update((m) => ({ ...m, [key]: { ...plant, state: nextState, stockCount: nextCount } }));
            tempSelectedPlant.set(null);

            // If no more requested items, mark success and remove after 5s
            if (Object.keys(newRequested).length === 0) {
                updated.status = OrderStatus.Success;
                // Trigger mascot celebration briefly
                this.showMascotSuccessFor(2000);
                // schedule removal and clear slot
                setTimeout(() => {
                    // remove from entities
                    orderEntities.update((inner) => {
                        const copy = { ...inner } as OrderEntities;
                        delete copy[orderId];
                        return copy;
                    });
                    // clear the slot that held this order
                    displaySlots.update((slots) => {
                        const idx = slots.indexOf(orderId);
                        if (idx === -1) return slots;
                        const next = [...slots];
                        next[idx] = null;
                        return next;
                    });
                }, 5000);
            }

            return { ...all, [orderId]: updated } as OrderEntities;
        });
    }

    // Restock: Out of Stock -> Available
    restockPlant(key: string): void {
        const plant = get(plantArray)[key];
        if (!plant || plant.state !== Stock.OutOfStock) return;
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.Available, stockCount: 10 } }));
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
        plantArray.update((m) => ({ ...m, [key]: { ...plant, state: Stock.Available, stockCount: 10 } }));
        // Track unlocked key for future order generation
        if (!this.unlockedKeys.includes(key)) this.unlockedKeys.push(key);
    }
}

export const game = new LeafGame();
