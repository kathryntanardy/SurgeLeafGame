<script lang="ts">
	import LeafGame from '$lib/components/LeafGame.svelte';
	import { game, plantsStore, scoreStore } from '$lib/game/LeafGame';
	import { plantData } from '$lib/game/plantData';
	import { Stock } from '$lib/game/LeafGame';

	const keyToId = Object.fromEntries(plantData.map((p) => [p.key, p.id]));
</script>

<div class="unlock-controls">
	{#each plantData as p}
		<button
			type="button"
			class="unlock"
			disabled={!$plantsStore[p.key] ||
				$plantsStore[p.key].state !== Stock.Default ||
				($scoreStore < $plantsStore[p.key].points && keyToId[p.key] !== 4)}
			on:click={() => game.unlockPlant(p.key)}
		>
			Unlock {p.altText} ({$plantsStore[p.key]
				? keyToId[p.key] === 4
					? 0
					: $plantsStore[p.key].points
				: ''})
		</button>
	{/each}
</div>

<div class="controls">
	{#each plantData as p}
		<button
			type="button"
			class="restock"
			disabled={!$plantsStore[p.key] ||
				$plantsStore[p.key].state !== Stock.OutOfStock ||
				($scoreStore < $plantsStore[p.key].points && keyToId[p.key] !== 4)}
			on:click={() => game.restockPlant(p.key)}
		>
			Restock {p.altText} ({$plantsStore[p.key]
				? keyToId[p.key] === 4
					? 0
					: $plantsStore[p.key].points
				: ''})
		</button>
	{/each}
</div>

<LeafGame />

<style>
	.unlock-controls {
		position: fixed;
		top: 1rem;
		left: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 10;
	}
	.unlock {
		padding: 0.4rem 0.6rem;
		font-size: 0.9rem;
	}
	.controls {
		position: fixed;
		top: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 10;
	}
	.restock {
		padding: 0.4rem 0.6rem;
		font-size: 0.9rem;
	}
	/* Hide buttons when not clickable */
	.unlock:disabled,
	.restock:disabled {
		opacity: 0;
		pointer-events: none;
	}
</style>
