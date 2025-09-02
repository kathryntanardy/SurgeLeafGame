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
    // Timer-related (optional, enabled when ENABLE_ORDER_TIMERS)
    createdAtMs?: number;
    expiresAtMs?: number;
    totalDurationMs?: number;
    hurry?: boolean;
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
                { id: p.id, key: p.key, points: p.points, bucketKey, state: initialState, stockCount: initialState === Stock.Available ? 10 : 0 }
            ];
        })
    )
);

// Back-compat and canonical naming for components expecting plantsStore
export type PlantRuntime = plantInfo;
export const plantsStore = plantArray;

// Mascot: frame state for Background rendering
export type MascotFrame = 'default1' | 'default2' | 'success' | 'failure';
export const mascotFrame = writable<MascotFrame>('default1');
// Global time source used for countdowns when timers are enabled
export const nowStore = writable<number>(Date.now());

// ---- Tunable gameplay timing values ----
// to control how often timer bars is updated (10 updates/sec)
export const NOW_TICK_MS = 100;
// Default duration for an order before it fails (not yet wired into logic)
export const ORDER_DEFAULT_DURATION_MS = 10_000;
// Threshold ratio at which a customer begins showing an unhappy face (e.g. 0.25 = last 25%)
export const ORDER_HURRY_THRESHOLD_RATIO = 0.25;
// How long a customer (success or failure) should remain before being removed
export const CUSTOMER_REMAIN_IN_SCREEN = 5_000;
// How long the mascot should celebrate success before returning to idle
export const MASCOT_SUCCESS_MS = 3_000;
// How long the mascot should show failure after an order fails
export const MASCOT_FAILURE_MS = 2_000;

export class LeafGame {
    private orderSeq: number = 1;
    private unlockedKeys: string[] = [];
    // Mascot internals
    private mascotTimerId: number | undefined = undefined;
    private mascotSuccessTimeoutId: number | undefined = undefined;
    // Timer ticker
    private nowTimerId: number | undefined = undefined;

    constructor() {
        // Initialize unlocked keys from plants that are currently Available
        const plants = Object.values(get(plantArray));
        this.unlockedKeys = plants.filter((p) => p.state === Stock.Available).map((p) => p.key);

        this.addOrder();
        setInterval(() => {
            this.addOrder();
        }, 3000);

        // Start global time ticker for order timers
        if (!this.nowTimerId) {
            this.nowTimerId = (setInterval(() => {
                nowStore.set(Date.now());
                this.updateTimers();
            }, NOW_TICK_MS) as unknown) as number;
        }

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

        // Initialize timer fields
        const created = Date.now();
        const totalDuration = ORDER_DEFAULT_DURATION_MS;
        entity.createdAtMs = created;
        entity.totalDurationMs = totalDuration;
        entity.expiresAtMs = created + totalDuration;
        entity.hurry = false;

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
            if (current === 'success' || current === 'failure') return; // don't toggle while reacting
            mascotFrame.set(current === 'default1' ? 'default2' : 'default1');
        }, 700) as unknown) as number; // ~0.7s feels natural
    }

    private stopMascotIdle(): void {
        if (this.mascotTimerId) {
            clearInterval(this.mascotTimerId);
            this.mascotTimerId = undefined;
        }
    }

    private stopNowTicker(): void {
        if (this.nowTimerId) {
            clearInterval(this.nowTimerId);
            this.nowTimerId = undefined;
        }
    }

    // Order timers: update by remaining time
    private updateTimers(): void {

        const now = get(nowStore);
        const toScheduleRemoval: number[] = [];

        orderEntities.update((all) => {
            const next: OrderEntities = { ...all };
            for (const [idStr, order] of Object.entries(all)) {
                const id = Number(idStr);
                if (!order) continue;
                if (order.status !== OrderStatus.InProgress) continue;
                if (order.expiresAtMs == null || order.totalDurationMs == null) continue;

                const msLeft = order.expiresAtMs - now;
                if (msLeft <= 0) {
                    // Queue removal: don't change the list while looping, show briefly, remove once
                    next[id] = { ...order, status: OrderStatus.Fail } as OrderEntity;
                    toScheduleRemoval.push(id);
                    // Show mascot failure
                    this.showMascotFailureFor();
                    continue;
                }

                // Enter hurry state near the end
                const threshold = order.totalDurationMs * ORDER_HURRY_THRESHOLD_RATIO;
                if (!order.hurry && msLeft <= threshold) {
                    next[id] = { ...order, hurry: true } as OrderEntity;
                }
            }
            return next;
        });

        // Schedule removals for orders that just failed this tick
        for (const orderId of toScheduleRemoval) {
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
            }, CUSTOMER_REMAIN_IN_SCREEN);
        }
    }

    private showMascotSuccessFor(ms: number = MASCOT_SUCCESS_MS): void {
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

    private showMascotFailureFor(ms: number = MASCOT_FAILURE_MS): void {
        if (this.mascotSuccessTimeoutId) {
            clearTimeout(this.mascotSuccessTimeoutId);
            this.mascotSuccessTimeoutId = undefined;
        }
        mascotFrame.set('failure');
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

            // Adjust score 
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
                this.showMascotSuccessFor();
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
                }, CUSTOMER_REMAIN_IN_SCREEN);
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
