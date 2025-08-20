<script lang="ts">
	import type { BucketData } from '$lib/game/bucketData';
	import { BucketState } from '$lib/game/bucketData';
	import Plant from './Plant.svelte';
	import { plantData } from '$lib/game/plantData';
	import { game } from '$lib/game/LeafGame';

	export let bucket: BucketData;

	$: isDefault = bucket.state === BucketState.Default;
	$: isAvailable = bucket.state === BucketState.Available;
	$: isOut = bucket.state === BucketState.OutOfStock;
	$: imgSrc = isDefault
		? bucket.images.default
		: isAvailable
			? bucket.images.available
			: bucket.images.outOfStock;

	$: bucketNum = Number(bucket.key.replace('bucket', ''));
	$: matchingPlant = plantData.find((p) => p.id === bucketNum);
</script>

<!-- Always render the bucket image (non-clickable) -->
<img
	src={imgSrc}
	alt={bucket.altText}
	class="bucket"
	class:available={isAvailable}
	class:default={isDefault}
	class:out={isOut}
	class:topBucket={bucket.key === 'bucket5' || bucket.id === 5}
	style="left: {bucket.position.left}; top: {bucket.position.top}; width: {bucket.position.width}"
	draggable="false"
/>

<!-- Render plant on top when available -->
{#if isAvailable && matchingPlant}
	<Plant
		plant={matchingPlant}
		bind:bucketState={bucket.state}
		on:click={() => game.plantClick(matchingPlant.key)}
	/>
{/if}

<style>
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
