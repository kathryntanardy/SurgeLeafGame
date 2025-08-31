//TODO: Modify code 

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
            left: '37.5vw',
            top: '60.56vh',
            width: '5vw'
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
            left: '39.2vw',
            top: '44.04vh',
            width: '6.5vw'
        }
    },
    {
        id: 4,
        key: 'bucket4',
        images: {
            default: '/bucket4/available.png',
            available: '/bucket4/available.png',
            outOfStock: '/bucket4/available.png'
        },
        altText: 'Bucket 4',
        position: {
            left: '55.95vw',
            top: '49.15vh',
            width: '4.2vw'
        }
    },
    {
        id: 5,
        key: 'bucket5',
        images: {
            default: '/bucket5/default.png',
            available: '/bucket5/available.png',
            outOfStock: '/bucket5/available.png'
        },
        altText: 'Bucket 5',
        position: {
            left: '58.77vw',
            top: '60.28vh',
            width: '10vw'
        }
    },
    {
        id: 6,
        key: 'bucket6',
        images: {
            default: '/bucket6/default.png',
            available: '/bucket6/available.png',
            outOfStock: '/bucket6/available.png'
        },
        altText: 'Bucket 6',
        position: {
            left: '67.23vw',
            top: '52.39vh',
            width: '6.5vw'
        }
    }
];

// Export item keys for game logic (e.g., order generation)
export const itemKeys: string[] = bucketData.map(b => b.key);
