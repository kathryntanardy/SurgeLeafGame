<script lang="ts">
	import HudBox from './HudBox.svelte';
	import { scoreStore } from '$lib/game/LeafGame';

	// TODO: Add timer and score functionality, clickable shop button.
	export let timerText: string = '00:00';
	export let onOpenModal;
</script>

<div class="center-strip">
	<div class="hud">
		<HudBox
			mode="display"
			iconSrc="/timeIcon.png"
			value={timerText}
			leftIconWidth="0.8vw"
			leftIconHeight="0.8vw"
		/>
		<HudBox
			mode="display"
			iconSrc="/leafIcon.png"
			value={$scoreStore}
			leftIconWidth="1.04vw"
			leftIconHeight="1.04vw"
		/>
		<HudBox mode="button" onClick={onOpenModal} />
	</div>
</div>

<style>
	.center-strip {
		position: absolute;
		/* top 28px -> 2.59vh */
		top: 2.59vh;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
	}

	.hud {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.8vw;
	}

	@container (max-width: 640px) {
		.center-strip {
			width: 90%; /* nearly full width; use 95cqw for slight inset */
		}
		.hud {
			width: 100%; /* let the flex row span the strip */
			justify-content: space-between; /* spread the 3 boxes edge-to-edge */
			gap: 0cqw; /* small minimum spacing */
			padding: 0 3cqw;
		}
	}
	
</style>
