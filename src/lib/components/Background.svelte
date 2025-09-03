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
		ORDER_DEFAULT_DURATION_MS,
		activeQTESession,
		ENABLE_QTE,
		thanksToasts
	} from '$lib/game/LeafGame';
	import { Stock } from '$lib/game/LeafGame';

	let shopOpen: boolean = false;
	function onOpenModal() {
		shopOpen = true;
	}
	function onCloseModal() {
		shopOpen = false;
	}

	function onRestockFromShop(e: CustomEvent<{ plantKey: string }>) {
		const { plantKey } = e.detail;
		// Close modal first
		onCloseModal();
		// Next microtask: either start QTE or call legacy restock
		queueMicrotask(() => {
			if (ENABLE_QTE) {
				// Prevent multiple simultaneous QTE sessions
				if ($activeQTESession) return;
				const session = game.deriveQTESessionFor(plantKey);
				if (session) activeQTESession.set(session);
			} else {
				game.restockPlant(plantKey);
			}
		});
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

<!-- Cancel QTE if plant state changes mid-session -->
{#if ENABLE_QTE && $activeQTESession}
	{#if $plantsStore[$activeQTESession.plantKey] && $plantsStore[$activeQTESession.plantKey].state !== Stock.OutOfStock}
		{@html (() => {
			activeQTESession.set(null);
			return '';
		})()}
	{/if}
{/if}

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
					thanksAmount={$thanksToasts.find((t) => t.slotIdx === i)?.amount ?? null}
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
		<ShopModal {plantsStore} {game} on:close={onCloseModal} on:restock={onRestockFromShop} />
	{/if}

	{#if ENABLE_QTE && $activeQTESession}
		<!-- Dimmer to block clicks elsewhere while QTE is active -->
		<div class="qte-dimmer" aria-hidden="true"></div>
		<!-- QTE overlay centered using plant's left/top and transform -->
		<div
			class="qte-overlay"
			style="left: {$activeQTESession.leftPct}; top: {$activeQTESession.topPct}; transform: {$activeQTESession.transformCss ??
				'none'}"
		>
			<QTE
				config={$activeQTESession.config}
				attempts={3}
				onQTE={() => {}}
				onDone={(successes) => {
					const s = Math.max(0, Math.min(3, Number(successes) || 0));
					const multiplier = s === 0 ? 0.5 : s === 1 ? 1.0 : s === 2 ? 1.5 : 3.0;
					const plantKey = $activeQTESession?.plantKey;
					if (plantKey) game.restockPlantWithMultiplier(plantKey, multiplier);
					activeQTESession.set(null);
				}}
			/>
		</div>
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

	/* removed unused toast styles; thanks now renders inside Customer's Order bubble */

	.qte-overlay {
		position: absolute;
		z-index: 150;
		pointer-events: auto;
	}

	.qte-dimmer {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		z-index: 140;
		pointer-events: all; /* block interactions behind */
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
