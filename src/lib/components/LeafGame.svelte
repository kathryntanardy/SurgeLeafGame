<script lang="ts">
	import Background from './Background.svelte';
</script>

<div id="leafGame">
	<Background />
</div>

<style>
	* {
		--leafGameHeight: 80vh;
	}

	#leafGame {
		height: var(--leafGameHeight);
		border: 1px solid;
		width: calc(100vw - 2px);
		overflow-x: hidden;
		background: #1b3534;
	}
</style>
