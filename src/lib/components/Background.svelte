<script lang="ts">
	import Bucket from './Bucket.svelte';
	import CenterStrip from './CenterStrip.svelte';
	import { bucketData } from '$lib/game/bucketData';
</script>

<div class="background">
	<img src="/background.png" alt="Background" class="background-image" />

	<CenterStrip />

	{#each bucketData as bucket (bucket.id)}
		<Bucket {bucket} />
	{/each}

	<img src="/placeholder_mascot.png" alt="Mascot" class="mascot" />
</div>

<style>
	* {
		--leafGameHeight: 80vh;
	}

	.background {
		height: 100%;
		width: 100%;
		position: relative;
		overflow: hidden;
	}

	.background-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;
	}

	/* All position and dimensions is converted assuming screen width 
    of 1920px and 1080px 
    with manual adjustments*/

	/* Mascot styles */
	.mascot {
		position: absolute;
		left: 43.9vw;
		top: 31.85vh;
		width: 12.2vw;
		height: auto;
		z-index: 1;
	}

	@keyframes -global-scroll {
		0% {
			background-position: 0 0;
		}

		100% {
			background-position: calc(-100% + 99vw) 0;
		}
	}
</style>
