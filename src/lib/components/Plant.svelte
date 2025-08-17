<script lang="ts">
	import { plantData } from '$lib/game/plantData';

	export let plant: any | undefined = undefined; // optional single plant
</script>

{#if plant}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<img
		src={plant.imageSrc}
		alt={plant.altText}
		class="plant"
		class:topOver={plant?.id === 2 || plant?.id === 5}
		style="left: {plant.position.left}; top: {plant.position.top}; width: {plant.position.width};"
		draggable="false"
	/>
{:else}
	{#each plantData as p (p.id)}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<img
			src={p.imageSrc}
			alt={p.altText}
			class="plant"
			class:topOver={p.id === 2 || p.id === 5}
			style="left: {p.position.left}; top: {p.position.top}; width: {p.position.width};"
			draggable="false"
		/>
	{/each}
{/if}

<style>
	.plant {
		position: absolute;
		display: block;
		height: auto;
		z-index: 1;
		cursor: pointer;
		user-select: none;
		-webkit-user-drag: none;
		touch-action: manipulation;
		transition:
			transform 0.15s ease,
			filter 0.15s ease;
	}

	/* Plant 2 sits above other buckets*/
	.plant.topOver {
		z-index: 3;
	}

	.plant:hover {
		transform: translateY(-1px);
		filter: brightness(1.05);
	}
	.plant:active {
		transform: translateY(0);
		filter: brightness(0.95);
	}
</style>
