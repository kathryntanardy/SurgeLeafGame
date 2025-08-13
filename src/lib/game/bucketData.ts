//TODO: Modify code 

export interface BucketData {
    id: number;
    imageSrc: string;
    altText: string;
    position: {
        left: string;
        top: string;
        width: string;
    };
    onClick: () => void;
}

export const bucketData: BucketData[] = [
    {
        id: 1,
        imageSrc: '/bucket1.png',
        altText: 'Bucket 1',
        position: {
            left: '25.33vw',
            top: '49.13vh',
            width: '8vw'
        },
        onClick: () => {
            console.log('Bucket 1 clicked!');
            // Add your bucket 1 click logic here
        }
    },
    {
        id: 2,
        imageSrc: '/bucket2.png',
        altText: 'Bucket 2',
        position: {
            left: '35.89vw',
            top: '60.56vh',
            width: '5vw'
        },
        onClick: () => {
            console.log('Bucket 2 clicked!');
            // Add your bucket 2 click logic here
        }
    },
    {
        id: 3,
        imageSrc: '/bucket3.png',
        altText: 'Bucket 3',
        position: {
            left: '38vw',
            top: '44.04vh',
            width: '6.5vw'
        },
        onClick: () => {
            console.log('Bucket 3 clicked!');
            // Add your bucket 3 click logic here
        }
    },
    {
        id: 4,
        imageSrc: '/bucket4.png',
        altText: 'Bucket 4',
        position: {
            left: '55.95vw',
            top: '49.15vh',
            width: '4.2vw'
        },
        onClick: () => {
            console.log('Bucket 4 clicked!');
            // Add your bucket 4 click logic here
        }
    },
    {
        id: 5,
        imageSrc: '/bucket5.png',
        altText: 'Bucket 5',
        position: {
            left: '58.77vw',
            top: '60.28vh',
            width: '10vw'
        },
        onClick: () => {
            console.log('Bucket 5 clicked!');
            // Add your bucket 5 click logic here
        }
    },
    {
        id: 6,
        imageSrc: '/bucket6.png',
        altText: 'Bucket 6',
        position: {
            left: '67.23vw',
            top: '52.39vh',
            width: '6.5vw'
        },
        onClick: () => {
            console.log('Bucket 6 clicked!');
            // Add your bucket 6 click logic here
        }
    }
];
