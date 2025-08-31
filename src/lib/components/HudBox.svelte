<script lang="ts">
	// Mode: display shows icon+value; button shows inner clickable icon
	export let mode: 'display' | 'button' = 'display';

	// Content
	export let value: string | number | undefined = undefined;
	export let onClick: (() => void) | undefined = undefined;

	// Visual assets
	export let containerSrc: string = '/container.png'; // box background (from /static)
	export let iconSrc: string | undefined = undefined; // left icon in display mode

	// Sizes (viewport-relative)
	export let leftIconWidth: string | undefined = undefined; // e.g., '1.04vw'
	export let leftIconHeight: string | undefined = undefined; // e.g., '1.85vh'
	export let buttonWidth: string = '5.6vw';
	export let buttonHeight: string = '2.2vh';

	// Derived defaults (kept close to 14.57px @ 1920x1080)
	const defaultLeftW = '0.78vw';
	const defaultLeftH = '1.50vh';
	const effectiveLeftW = leftIconWidth ?? defaultLeftW;
	const effectiveLeftH = leftIconHeight ?? defaultLeftH;
</script>

{#if mode === 'button'}
	<!-- Static background box; only the inner image button is clickable -->
	<div class="hud-box" style="background-image: url({containerSrc});">
		<button
			type="button"
			class="icon-button"
			style:width={buttonWidth}
			style:height={buttonHeight}
			on:click={onClick}
		>
			<img src="/view_shop.png" alt="" class="icon" aria-hidden="true" />
		</button>
	</div>
{:else}
	<div class="hud-box" style="background-image: url({containerSrc});">
		{#if iconSrc}
			<img
				src={iconSrc}
				alt=""
				class="left-icon"
				aria-hidden="true"
				style:width={effectiveLeftW}
				style:height={effectiveLeftH}
			/>
		{/if}
		{#if value !== undefined}
			<span class="value" aria-live="polite">{value}</span>
		{/if}
	</div>
{/if}

<style>
	.hud-box {
		/* 181px x 43px -> 9.43vw x 3.98vh */
		width: 9.43vw;
		height: 3.98vh;
		background-size: 100% 100%;
		background-repeat: no-repeat;
		background-position: center;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		gap: 0.6vw;
		border: 0;
		padding: 0 0.8vw;
	}

	/* Default left icon size; can be overridden inline */
	.left-icon {
		width: 0.76vw;
		height: 1.35vh;
		pointer-events: none;
	}

	.icon-button {
		background: transparent;
		border: 0;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.15s ease,
			filter 0.15s ease;
	}
	/* .icon-button:hover { } */
	.icon-button:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}

	.icon {
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: auto; /* ensure the button handles events */
	}

	.value {
		/* 12px on 1920x1080 -> 0.625vw or ~1.11vh */
		font-size: max(0.625vw, 1.11vh);
		color: #8a6f6a;
		font-family: 'Catriel', catriel, sans-serif;
		font-weight: 400;
		letter-spacing: 0.02em;
	}
</style>
