<script lang="ts">
	// Text-only order card with optional absolute positioning
	export let text: string | undefined = undefined;
	export let left: string | undefined = undefined;
	export let top: string | undefined = undefined;

	// Expose measured height to parent
	export let height: number = 0;
	let cardEl: HTMLDivElement | null = null;
	$: height = cardEl ? cardEl.offsetHeight : 0;
</script>

<div class="order-card" bind:this={cardEl} style:left style:top>
	{#if text}
		<p class="order-text">{text}</p>
	{:else}
		<slot />
	{/if}
</div>

<style>
	.order-card {
		position: absolute;
		background: #fffccf;
		border-radius: 10px;
		padding: 8px 10px;
		width: 88px;
		font-family: sans-serif;
		color: #6d6d6d;
		font-size: 14px;
		line-height: 1.3;
		z-index: 5;
	}
	.order-text {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
