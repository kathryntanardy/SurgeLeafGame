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
            left: '30%',
            top: '61.13%',
            width: '7%'
        }
    },
    {
        id: 2,
        key: 'bucket2',
        images: {
            default: '/bucket1/default.png',
            available: '/bucket1/available.png',
            outOfStock: '/bucket1/available.png'
        },
        altText: 'Bucket 2',
        position: {
            left: '38%',
            top: '75%',
            width: '5%'
        }
    },
    {
        id: 3,
        key: 'bucket3',
        images: {
            default: '/bucket1/default.png',
            available: '/bucket1/available.png',
            outOfStock: '/bucket1/available.png'
        },
        altText: 'Bucket 3',
        position: {
            left: '42%',
            top: '55%',
            width: '6.5%'
        }
    },
    {
        id: 4,
        key: 'bucket4',
        images: {
            default: '/bucket1/default.png',
            available: '/bucket1/available.png',
            outOfStock: '/bucket1/available.png'
        },
        altText: 'Bucket 4',
        position: {
            left: '58%',
            top: '63%',
            width: '4.2%'
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
            left: '63%',
            top: '79.28%',
            width: '9%'
        }
    },
    {
        id: 6,
        key: 'bucket6',
        images: {
            default: '/bucket5/default.png',
            available: '/bucket5/available.png',
            outOfStock: '/bucket5/available.png'
        },
        altText: 'Bucket 6',
        position: {
            left: '70%',
            top: '68%',
            width: '6.5%'
        }
    }
];

// Export item keys for game logic (e.g., order generation)
export const itemKeys: string[] = bucketData.map(b => b.key);
