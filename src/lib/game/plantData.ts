// Simple plant data (no types/enums yet). Each plant lives under its bucket folder.

export const plantData = [
    {
        id: 1,
        key: 'plant1',
        imageSrc: '/bucket1/plant.png',
        altText: 'Monstera',
        // 390px -> 20.31vw, 115px -> 10.65vh, 336px -> 17.5vw
        position: { left: '21.31vw', top: '11.65vh', width: '15.5vw' },
        points: 100,
    },
    {
        id: 2,
        key: 'plant2',
        imageSrc: '/bucket2/plant.png',
        altText: 'River Vine',
        // 314px -> 16.35vw, 442px -> 40.93vh, 1052px -> 54.79vw (user adjusted top to 43.93vh)
        position: { left: '18.46vw', top: '43.93vh', width: '54.79vw' },
        points: 3000,
    },
    {
        id: 3,
        key: 'plant3',
        imageSrc: '/bucket3/plant.png',
        altText: 'Tomato',
        position: { left: '38.75vw', top: '8.80vh', width: '6.58vw' },
        points: 20,
    },
    {
        id: 4,
        key: 'plant4',
        imageSrc: '/bucket4/plant.png',
        altText: 'Staff Stick',
        // left 1069px -> 55.73vw, top 310px -> 28.70vh, width 115px -> 5.99vw (user adjusted left)
        position: { left: '54.73vw', top: '28.70vh', width: '5.99vw' },
        points: 5,
    },
    {
        id: 5,
        key: 'plant5',
        imageSrc: '/bucket5/plant.png',
        altText: 'Mega Carrot',
        // left 1146px -> 59.69vw, top 360px -> 33.33vh, width 152px -> 7.92vw
        position: { left: '59.69vw', top: '33.33vh', width: '7.92vw' },
        points: 99999,
    },
    {
        id: 6,
        key: 'plant6',
        imageSrc: '/bucket6/plant.png',
        altText: 'Giant Dandelion',
        // left 1308px -> 68.13vw, top 216px -> 20vh, width 204px -> 10.63vw (user adjusted left to 67.13vw)
        position: { left: '67.13vw', top: '20vh', width: '10.63vw' },
        points: 250,
    }
];

export const plantKeys: string[] = plantData.map((p) => p.key);
