<script lang="ts">
	import type { BucketData } from '$lib/game/bucketData';
	import { BucketState } from '$lib/game/bucketData';

	export let bucket: BucketData;

	$: isDefault = bucket.state === BucketState.Default;
	$: isAvailable = bucket.state === BucketState.Available;
	$: isOut = bucket.state === BucketState.OutOfStock;
	$: imgSrc = isDefault
		? bucket.images.default
		: isAvailable
			? bucket.images.available
			: bucket.images.outOfStock;
	$: pos = isAvailable && bucket.availablePosition ? bucket.availablePosition : bucket.position;
	$: isBucket4 = bucket.key === 'bucket4' || bucket.id === 4;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<img
	src={imgSrc}
	alt={bucket.altText}
	class="bucket"
	class:available={isAvailable}
	class:default={isDefault}
	class:out={isOut}
	class:dim={isBucket4}
	style="left: {pos.left}; top: {pos.top}; width: {pos.width};"
	on:click={bucket.onClick}
/>

<style>
	.bucket {
		position: absolute;
		height: auto;
		z-index: 1;
		cursor: default;
		transition: transform 0.2s ease;
	}

	.bucket.available {
		cursor: pointer;
	}

	/* Only available buckets get a hover effect */
	.bucket.available:hover {
		transform: scale(1.05);
	}

	/* Dimmed bucket variant (bucket 4) */
	.bucket.dim {
		opacity: 0.3;
	}
</style>
