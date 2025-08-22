<script lang="ts">
	import type { BucketData } from '$lib/game/bucketData';
	import { Stock } from '$lib/game/LeafGame';
	import Plant from './Plant.svelte';
	import { plantData } from '$lib/game/plantData';
	import { game, plantsStore } from '$lib/game/LeafGame';

	export let bucket: BucketData;

	// Plant/bucket state now driven by plantsStore (runtime)
	$: bucketNum = Number(bucket.key.replace('bucket', ''));
	$: matchingPlant = plantData.find((p) => p.id === bucketNum);
	$: plantState = matchingPlant ? $plantsStore[matchingPlant.key]?.state : undefined;
	$: isDefault = plantState === Stock.Default;
	$: isAvailable = plantState === Stock.Available;
	$: isOut = plantState === Stock.OutOfStock;
	$: imgSrc = isDefault
		? bucket.images.default
		: isAvailable
			? bucket.images.available
			: bucket.images.outOfStock;
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

<!-- Render plant on top when not Default (Available or OutOfStock) -->
{#if !isDefault && matchingPlant}
	<Plant
		plant={matchingPlant}
		bucketState={plantState ?? Stock.Default}
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
