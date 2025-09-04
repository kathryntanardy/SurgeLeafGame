<script lang="ts">
	import Background from './Background.svelte';
	import { isMobile } from '$lib/layout';
</script>

<div id="leafGame" class:mobile={$isMobile}>
	<Background />
</div>

<style>
	* {
		--leafGameHeight: 80vh;
	}

	#leafGame {
		/* Scale height with width; keep within viewport */
		width: calc(100vw - 2px);
		aspect-ratio: 19 / 8;
		height: auto;
		max-height: 100vh;
		border: 1px solid;
		overflow: visible;
		background: #1b3534;
	}
	#leafGame.mobile {
		aspect-ratio: 393 / 852;
		width: 100vw;
		height: auto;
		max-height: 100vh;
	}
</style>
