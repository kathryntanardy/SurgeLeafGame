<script lang="ts">
	import type { BucketData } from '$lib/game/bucketData';
	import { BucketState } from '$lib/game/bucketData';
	import Plant from './Plant.svelte';
	import { plantData } from '$lib/game/plantData';

	export let bucket: BucketData;

	$: isDefault = bucket.state === BucketState.Default;
	$: isAvailable = bucket.state === BucketState.Available;
	$: isOut = bucket.state === BucketState.OutOfStock;
	$: imgSrc = isDefault
		? bucket.images.default
		: isAvailable
			? bucket.images.available
			: bucket.images.outOfStock;
	// Always use the base position
	$: pos = bucket.position;

	// find matching plant by bucket key if needed
	$: matchingPlant = plantData.find((p) => p.key.endsWith(bucket.key.replace('bucket', '')));
	$: isBucket5 = bucket.key === 'bucket5' || bucket.id === 5;
</script>

<!-- Always render the bucket image (non-clickable) -->
<img
	src={imgSrc}
	alt={bucket.altText}
	class="bucket"
	class:available={isAvailable}
	class:default={isDefault}
	class:out={isOut}
	class:topBucket={isBucket5}
	style="left: {pos.left}; top: {pos.top}; width: {pos.width};"
	draggable="false"
/>

<!-- Render plant on top when available -->
{#if isAvailable && matchingPlant}
	<Plant plant={matchingPlant} />
{/if}

<style>
	/* Common bucket styling lives here (not in data) */
	.bucket {
		display: block;
		position: absolute;
		height: auto;
		z-index: 2; /* base bucket above most plants */
		cursor: default;
	}

	/* Bucket 5 above everything else */
	.bucket.topBucket {
		z-index: 4;
	}
</style>
