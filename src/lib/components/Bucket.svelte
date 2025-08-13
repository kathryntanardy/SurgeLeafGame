<script lang="ts">
	import type { BucketData } from '$lib/game/bucketData';

	export let bucket: BucketData;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			bucket.onClick();
		}
	}
</script>

<img
	src={bucket.imageSrc}
	alt={bucket.altText}
	class="bucket"
	style="left: {bucket.position.left}; top: {bucket.position.top}; width: {bucket.position.width};"
	on:click={bucket.onClick}
	on:keydown={handleKeydown}
	tabindex="0"
	role="button"
/>

<style>
	.bucket {
		position: absolute;
		height: auto;
		z-index: 1;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.bucket:hover {
		transform: scale(1.05);
	}
</style>
