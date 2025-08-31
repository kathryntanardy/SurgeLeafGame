<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Stock, game } from '$lib/game/LeafGame';
	type PlantMeta = {
		key: string;
		imageSrc: string;
		position: { left: string; top: string; width: string };
	};
	export let plant: PlantMeta;
	export let bucketState: Stock;
	const dispatch = createEventDispatcher();
	$: isAvailable = bucketState === Stock.Available;
	$: isOut = bucketState === Stock.OutOfStock;
</script>

<img
	src={plant.imageSrc}
	alt=""
	class="plant"
	class:disabled={isOut}
	style="left:{plant.position.left}; top:{plant.position.top}; width:{plant.position.width}"
	draggable="false"
	on:click={() => isAvailable && dispatch('click')}
/>

<style>
	.plant {
		position: absolute;
		display: block;
		height: auto;
		z-index: 3; /* above customers (z-index:1) and buckets (z-index:2) */
		cursor: pointer;
		transition:
			transform 0.15s ease,
			filter 0.15s ease,
			opacity 0.15s ease;
	}
	.plant:hover {
		transform: translateY(-1px);
		filter: brightness(1.05);
	}
	.plant:active {
		transform: translateY(0);
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
