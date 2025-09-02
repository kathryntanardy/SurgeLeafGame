<script lang="ts">
	import Bucket from './Bucket.svelte';
	import CenterStrip from './CenterStrip.svelte';
	import { bucketData } from '$lib/game/bucketData';
	import Customer from '$lib/components/Customer.svelte';
	import ShopModal from '$lib/components/ShopModal.svelte';
	import QTE from '$lib/components/QTE.svelte';
	import {
		OrderStatus,
		orderEntities,
		game,
		displaySlots,
		plantsStore,
		mascotFrame,
		nowStore,
		ORDER_DEFAULT_DURATION_MS
	} from '$lib/game/LeafGame';

	let shopOpen: boolean = false;
	function onOpenModal() {
		shopOpen = true;
	}
	function onCloseModal() {
		shopOpen = false;
	}

	const toText = (ent: { requestedPlants: Record<string, number> }) =>
		Object.entries(ent.requestedPlants)
			.map(([k, qty]) => `${k} x${qty}`)
			.join(', ');

	const leftFor = (i: number) => (i === 0 ? '32%' : i === 1 ? '47%' : '60%');
	const topFor = (i: number) => (i === 0 ? '25%' : i === 1 ? '22%' : '25%');

	// Compute a dynamic vertical gap for the order bubble based on remaining TYPES (icons)
	// Fewer types remaining -> bubble closer to customer
	const orderGapFor = (ent: {
		requestedPlants: Record<string, number>;
		deliveredPlants: Record<string, number>;
	}) => {
		const typesRemaining = Object.keys(ent.requestedPlants ?? {}).length;
		const maxGapVh = 1.2; // when many types remain
		const minGapVh = 0.1; // when only one type remains
		if (typesRemaining <= 1) return `${minGapVh}vh`;
		if (typesRemaining === 2) return `${(maxGapVh + minGapVh) / 2}vh`;
		return `${maxGapVh}vh`;
	};

	// Compute a 0..1 ratio of remaining time for timer UI
	const timerRatioFor = (ent: { expiresAtMs?: number; totalDurationMs?: number }) => {
		const total = ent.totalDurationMs ?? ORDER_DEFAULT_DURATION_MS;
		if (!ent.expiresAtMs || !total) return undefined;
		const msLeft = Math.max(0, ent.expiresAtMs - $nowStore);
		return msLeft / total;
	};

	// const sampleConfig = {
	// 	duration: 2.5,
	// 	count: 3,
	// 	major: 0.2,
	// 	minor: 0.35,
	// 	majorMod: 1.0,
	// 	minorMod: 0.5
	// };

	// function someFunction() {}
</script>

<div class="background">
	<img src="/background.png" alt="Background" class="background-image" />

	<!-- Vignette overlay -->
	<div class="vignette" aria-hidden="true"></div>

	<!-- Corner overlays -->
	<img src="/left.png" alt="" class="edge edge-left" aria-hidden="true" />
	<img src="/right.png" alt="" class="edge edge-right" aria-hidden="true" />

	{#each bucketData as bucket (bucket.id)}
		<Bucket {bucket} />
	{/each}

	<!-- Customers from fixed slots to keep positions stable -->
	{#each $displaySlots as slotId, i}
		{#if slotId !== null}
			{#if $orderEntities[slotId]}
				{@const ent = $orderEntities[slotId]}
				<Customer
					state={ent.status as OrderStatus}
					orderText={toText(ent)}
					orderItems={ent.requestedPlants}
					orderGapY={orderGapFor(ent)}
					timerRatio={timerRatioFor(ent)}
					hurry={ent.hurry}
					left={leftFor(i)}
					top={topFor(i)}
					mirror={i === 0}
					on:click={() => game.deliverPlant(ent.id)}
				/>
			{/if}
		{/if}
	{/each}

	{#if $mascotFrame === 'success'}
		<img src="/mascot/success.png" alt="Mascot" class="mascot" />
	{:else if $mascotFrame === 'failure'}
		<img src="/mascot/failure.png" alt="Mascot" class="mascot" />
	{:else if $mascotFrame === 'default2'}
		<img src="/mascot/default_frame2.png" alt="Mascot" class="mascot" />
	{:else}
		<img src="/mascot/default_frame1.png" alt="Mascot" class="mascot" />
	{/if}

	<!-- Center HUD strip (timer, score, view shop) -->
	<CenterStrip {onOpenModal} />

	{#if shopOpen}
		<ShopModal {plantsStore} {game} on:close={onCloseModal} />
	{/if}

	<!-- <div class="tempqte">
		<QTE config={sampleConfig} onQTE={someFunction} />
	</div> -->
</div>

<style>
	* {
		--leafGameHeight: 80vh;
	}

	.background {
		height: 100%;
		width: 100%;
		position: relative;
		container-type: size;
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

	.vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 2;
		background:
			radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.35) 100%),
			radial-gradient(ellipse at top left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0) 50%),
			radial-gradient(ellipse at top right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0) 50%),
			radial-gradient(ellipse at bottom left, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0) 60%),
			radial-gradient(ellipse at bottom right, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0) 60%);
	}

	.edge {
		position: absolute;
		bottom: 0;
		/* height: auto; */
	}

	.edge-left {
		left: 0;
		width: 28%;
		transform: translate(-15%, 0);
	}
	.edge-right {
		right: 0;
		width: 20%;
	}

	.mascot {
		position: absolute;
		left: 44%;
		top: 40%;
		width: 12%;
		height: auto;
		z-index: 1;
	}

	/* .tempqte {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 150;
	} */

	@keyframes -global-scroll {
		0% {
			background-position: 0 0;
		}

		100% {
			background-position: calc(-100% + 99vw) 0;
		}
	}
</style>
