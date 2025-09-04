export type QTEConfig = {
    duration: number; // seconds for a full rotation
    count: number;    // number of hotspot centers
    major: number;    // seconds: half-width of the major arc window (total width = 2*major)
    minor: number;    // seconds: additional half-width beyond major for minor window
    majorMod: number; // per-click value to return when hitting major
    minorMod: number; // per-click value to return when hitting minor
    offsetYcqh?: number; // optional extra vertical translate in cqh (positive moves down)
};

export const qteConfigByPlant: Record<string, QTEConfig> = {
    // Monstera
    plant1: {
        duration: 2.5,
        count: 3,
        major: 0.20,
        minor: 0.35,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -14
    },
    // Vine
    plant2: {
        duration: 3.0,
        count: 3,
        major: 0.18,
        minor: 0.30,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: 8
    },
    // Tomato
    plant3: {
        duration: 2.2,
        count: 3,
        major: 0.22,
        minor: 0.32,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -25
    },
    // Staff Stick
    plant4: {
        duration: 2.0,
        count: 3,
        major: 0.05,
        minor: 0.05,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -15
    },
    // Carrot
    plant5: {
        duration: 3.2,
        count: 3,
        major: 0.18,
        minor: 0.28,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -15
    },
    // Dandelion
    plant6: {
        duration: 2.8,
        count: 3,
        major: 0.20,
        minor: 0.30,
        majorMod: 1.0,
        minorMod: 1.0,
        offsetYcqh: -20
    },
};




