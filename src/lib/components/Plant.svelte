<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Stock, game } from '$lib/game/LeafGame';
	type PlantMeta = {
		key: string;
		imageSrc: string;
		position: { left?: string; top?: string; width: string; transform?: string };
	};
	export let plant: PlantMeta;
	export let bucketState: Stock;
	// Base position typically inherited from the corresponding bucket (left/top in %)
	export let basePosition: { left: string; top: string } | null = null;
	const dispatch = createEventDispatcher();
	$: isAvailable = bucketState === Stock.Available;
	$: isOut = bucketState === Stock.OutOfStock;
	$: posLeft = basePosition?.left ?? plant.position.left;
	$: posTop = basePosition?.top ?? plant.position.top;
	$: imgTransform = plant.position.transform ?? '';
</script>

<img
	src={plant.imageSrc}
	alt=""
	class="plant"
	class:overBucket={plant.key === 'plant2'}
	class:overPlant2={plant.key === 'plant5'}
	class:disabled={isOut}
	style="left:{posLeft}; top:{posTop}; width:{plant.position.width}; transform:{imgTransform}"
	draggable="false"
	on:click={() => isAvailable && dispatch('click')}
/>

<style>
	.plant {
		position: absolute;
		display: block;
		height: auto;
		z-index: 1; /* below buckets (z-index:2) */
		cursor: pointer;
		transition:
			transform 0.15s ease,
			filter 0.15s ease,
			opacity 0.15s ease;
	}
	.plant.overBucket {
		z-index: 8;
	}

	.plant.overPlant2 {
		z-index: 9;
	}
	/* plant4 tap overlay sits above plant2/buckets but is invisible */

	.plant:hover {
		filter: brightness(1.05);
	}
	.plant:active {
		filter: brightness(0.95);
	}
	.plant.disabled {
		opacity: 0.3;
		pointer-events: none;
		cursor: default;
		filter: none;
		transform: none;
	}
</style>
