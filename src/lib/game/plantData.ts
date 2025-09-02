// Simple plant data (no types/enums yet). Each plant lives under its bucket folder.

export const plantData = [
    {
        id: 1,
        key: 'plant1',
        imageSrc: '/bucket1/plant.png',
        altText: 'Monstera',
        // width uses vw; left/top inherit from bucket; adjust via transform
        position: {
            width: '15%',
            transform: 'translate(-57%, -88%)'
        },
        points: 100,
    },
    {
        id: 2,
        key: 'plant2',
        imageSrc: '/bucket2/plant.png',
        altText: 'River Vine',
        position: {
            width: '50%',
            transform: 'translate(-40%, -42%)'
        },
        points: 3000,
    },
    {
        id: 3,
        key: 'plant3',
        imageSrc: '/bucket3/plant.png',
        altText: 'Tomato',
        position: {
            width: '6.5%',
            transform: 'translate(-56%, -95%)'
        },
        points: 20,
    },
    {
        id: 4,
        key: 'plant4',
        imageSrc: '/bucket4/plant.png',
        altText: 'Staff Stick',
        position: {
            width: '6%',
            transform: 'translate(-50%, -85%)'
        },
        points: 5,
    },
    {
        id: 5,
        key: 'plant5',
        imageSrc: '/bucket5/plant.png',
        altText: 'Mega Carrot',
        position: {
            width: '7%',
            transform: 'translate(-50%, -97%)'
        },
        points: 99999,
    },
    {
        id: 6,
        key: 'plant6',
        imageSrc: '/bucket6/plant.png',
        altText: 'Giant Dandelion',
        position: {
            width: '11%',
            transform: 'translate(-32%, -90%)'
        },
        points: 250,
    }
];

export const plantKeys: string[] = plantData.map((p) => p.key);
