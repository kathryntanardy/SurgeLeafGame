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
			leftIconWidth="1.04vw"
			leftIconHeight="1.85vh"
		/>
		<HudBox
			mode="display"
			iconSrc="/leafIcon.png"
			value={$scoreStore}
			leftIconWidth="1.04vw"
			leftIconHeight="1.85vh"
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
</style>
