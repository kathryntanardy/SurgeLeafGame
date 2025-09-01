<script lang="ts">
	// Text-only order card with optional absolute positioning
	export let text: string | undefined = undefined;
	export let left: string | undefined = undefined;
	export let top: string | undefined = undefined;
	// Optional translateY (e.g., 'calc(-100% - 1vh)') to bottom-anchor without measuring height
	export let translateY: string | undefined = undefined;
	// Optional progress for a timer bar (1..0 remaining)
	export let progress: number | undefined = undefined;

	// Expose measured height to parent
	export let height: number = 0;
	let cardEl: HTMLDivElement | null = null;
	$: height = cardEl ? cardEl.offsetHeight : 0;

	// Derived width string for timer bar
	$: clampedProgress = progress == null ? null : Math.max(0, Math.min(1, progress));
	$: pctWidth = clampedProgress == null ? '100%' : `${Math.round(clampedProgress * 100)}%`;
	$: hasTimer = progress !== undefined;
</script>

<div
	class="order-card"
	bind:this={cardEl}
	style:left
	style:top
	style:transform={translateY ? `translateY(${translateY})` : undefined}
	data-progress={progress}
>
	{#if text}
		<p class="order-text">{text}</p>
	{:else}
		<slot />
	{/if}
	{#if hasTimer}
		<div class="order-timer">
			<div class="order-timer-fill" style:width={pctWidth}></div>
		</div>
	{/if}
</div>

<style>
	.order-card {
		position: absolute;
		background: #fffccf;
		border-radius: 10px;
		padding: 8px 10px 18px;
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
	.order-timer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 6px;
		height: 8px;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 0;
		overflow: hidden;
	}
	.order-timer-fill {
		height: 100%;
		background: #7a5b73;
		border-radius: 0;
	}
</style>
