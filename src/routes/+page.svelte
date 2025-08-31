<script lang="ts">
	import LeafGame from '$lib/components/LeafGame.svelte';
	import { game, plantsStore, scoreStore } from '$lib/game/LeafGame';
	import { plantData } from '$lib/game/plantData';
	import { Stock } from '$lib/game/LeafGame';

	const keyToId = Object.fromEntries(plantData.map((p) => [p.key, p.id]));
</script>

<LeafGame />

<style>

</style>
