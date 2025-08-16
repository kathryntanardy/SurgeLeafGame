//TODO: Modify code 

export enum BucketState {
    Default = 'default',
    Available = 'available',
    OutOfStock = 'out_of_stock'
}

export interface BucketPosition {
    left: string;
    top: string;
    width: string;
}

export interface BucketImages {
    default: string;
    available: string; // available & out_of_stock can share same image
    outOfStock: string;
}

export interface BucketData {
    id: number;
    key: string; // stable key used by game logic/orders
    images: BucketImages;
    altText: string;
    position: BucketPosition;
    availablePosition?: BucketPosition; // optional alternate position when Available
    state: BucketState;
    onClick: () => void;
}

export const bucketData: BucketData[] = [
    {
        id: 1,
        key: 'bucket1',
        images: {
            default: '/bucket1/default.png',
            available: '/bucket1/available.png',
            outOfStock: '/bucket1/available.png'
        },
        altText: 'Bucket 1',
        position: {
            left: '25.33vw',
            top: '49.13vh',
            width: '8vw'
        },
        // example: different position when available (adjust as needed)
        // availablePosition: { left: '26vw', top: '48vh', width: '8vw' },
        state: BucketState.Default,
        onClick: () => {
            console.log('Bucket 1 clicked!');
        }
    },
    {
        id: 2,
        key: 'bucket2',
        images: {
            default: '/bucket2/default.png',
            available: '/bucket2/available.png',
            outOfStock: '/bucket2/available.png'
        },
        altText: 'Bucket 2',
        position: {
            left: '35.89vw',
            top: '60.56vh',
            width: '5vw'
        },
        state: BucketState.Default,
        onClick: () => {
            console.log('Bucket 2 clicked!');
        }
    },
    {
        id: 3,
        key: 'bucket3',
        images: {
            default: '/bucket3/default.png',
            available: '/bucket3/available.png',
            outOfStock: '/bucket3/available.png'
        },
        altText: 'Bucket 3',
        position: {
            left: '38vw',
            top: '44.04vh',
            width: '6.5vw'
        },
        state: BucketState.Default,
        onClick: () => {
            console.log('Bucket 3 clicked!');
        }
    },
    {
        id: 4,
        key: 'bucket4',
        images: {
            // default will mirror available since bucket4 is never in true default state
            default: '/bucket4/available.png',
            available: '/bucket4/available.png',
            outOfStock: '/bucket4/available.png'
        },
        altText: 'Bucket 4',
        position: {
            left: '53.33vw',  // 1024px -> 53.33vw (1024/1920*100)
            top: '27.5vh',    // 297px  -> 27.5vh (297/1080*100)
            width: '9.1vw'    // 174.88px -> 9.1vw (174.88/1920*100)
        },
        // Bucket 4 starts as Available and only toggles between Available/OutOfStock
        state: BucketState.Available,
        onClick: () => {
            console.log('Bucket 4 clicked!');
        }
    },
    {
        id: 5,
        key: 'bucket5',
        images: {
            default: '/bucket5.png',
            available: '/bucket5.png',
            outOfStock: '/bucket5.png'
        },
        altText: 'Bucket 5',
        position: {
            left: '58.77vw',
            top: '60.28vh',
            width: '10vw'
        },
        state: BucketState.Default,
        onClick: () => {
            console.log('Bucket 5 clicked!');
        }
    },
    {
        id: 6,
        key: 'bucket6',
        images: {
            default: '/bucket6.png',
            available: '/bucket6.png',
            outOfStock: '/bucket6.png'
        },
        altText: 'Bucket 6',
        position: {
            left: '67.23vw',
            top: '52.39vh',
            width: '6.5vw'
        },
        state: BucketState.Default,
        onClick: () => {
            console.log('Bucket 6 clicked!');
        }
    }
];

// Export item keys for game logic (e.g., order generation)
export const itemKeys: string[] = bucketData.map(b => b.key);
