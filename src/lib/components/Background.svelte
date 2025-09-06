<script lang="ts">
	import Bucket from './Bucket.svelte';
	import CenterStrip from './CenterStrip.svelte';
	import { bucketData } from '$lib/game/bucketData';
	import Customer from '$lib/components/Customer.svelte';
	import ShopModal from '$lib/components/ShopModal.svelte';
	import QTE from '$lib/components/QTE.svelte';
	import { observeLayout, isMobile, isNarrow } from '$lib/layout';
	import {
		OrderStatus,
		orderEntities,
		game,
		displaySlots,
		plantsStore,
		mascotFrame,
		nowStore,
		ORDER_DEFAULT_DURATION_MS,
		GAME_DURATION_MS,
		activeQTESession,
		ENABLE_QTE,
		thanksToasts,
		gamePhase,
		gameEndsAt,
		scoreStore
	} from '$lib/game/LeafGame';
	import { derived } from 'svelte/store';
	import { Stock } from '$lib/game/LeafGame';
	import { customerSlots } from '$lib/game/customerData';
	import InstructionsModal from './InstructionsModal.svelte';
	import EndingModal from './EndingModal.svelte';

	let shopOpen: boolean = false;
	function onOpenModal() {
		shopOpen = true;
	}
	function onCloseModal() {
		shopOpen = false;
	}

	// Reactive QTE session that recalculates position when layout changes
	const reactiveQTESession = derived(
		[activeQTESession, isMobile, isNarrow],
		([session, mobile, narrow]) => {
			if (!session) return null;
			// Recalculate position when layout changes
			return game.recalculateQTEPosition(session.plantKey);
		}
	);

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

	// Reactive functions that update when layout changes
	$: pickPos = (i: number) => {
		const slot = customerSlots[i];
		if ($isNarrow) return slot.mobileNarrowPosition ?? slot.mobilePosition ?? slot.position;
		if ($isMobile) return slot.mobilePosition ?? slot.position;
		return slot.position;
	};
	$: leftFor = (i: number) => pickPos(i).left;
	$: topFor = (i: number) => pickPos(i).top;
	$: widthFor = (i: number) => pickPos(i).width ?? '8%';
	$: gapFor = (i: number) => {
		const slot = customerSlots[i];
		if ($isNarrow)
			return slot.mobileNarrowOrderGapY ?? slot.mobileOrderGapY ?? slot.orderGapY ?? '5%';
		if ($isMobile) return slot.mobileOrderGapY ?? slot.orderGapY ?? '5%';
		return slot.orderGapY ?? '5%';
	};

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

	// Global session countdown text (MM:SS)
	$: sessionTimeLeftMs =
		$gamePhase === 'running' && $gameEndsAt
			? Math.max(0, $gameEndsAt - $nowStore)
			: $gamePhase === 'ended'
				? 0
				: GAME_DURATION_MS;
	function fmt(ms: number) {
		const s = Math.floor(ms / 1000);
		const mm = String(Math.floor(s / 60)).padStart(2, '0');
		const ss = String(s % 60).padStart(2, '0');
		return `${mm}:${ss}`;
	}

	// const sampleConfig = {
	// 	duration: 2.5,
	// 	count: 3,
	// 	major: 0.2,
	// 	minor: 0.35,
	// 	majorMod: 1.0,
	// 	minorMod: 0.5
	// };

	// function someFunction() {}

	$: orderWidthFor = (i: number) => {
		const slot = customerSlots[i];
		if ($isNarrow) return slot.mobileNarrowOrderWidth ?? slot.mobileOrderWidth ?? slot.orderWidth;
		if ($isMobile) return slot.mobileOrderWidth ?? slot.orderWidth;
		return slot.orderWidth;
	};

	$: orderTransformFor = (i: number, baseTranslate: string) => {
		const slot = customerSlots[i];
		const t = $isNarrow
			? (slot.mobileNarrowOrderTransform ?? slot.mobileOrderTransform ?? slot.orderTransform)
			: $isMobile
				? (slot.mobileOrderTransform ?? slot.orderTransform)
				: slot.orderTransform;
		return t ?? baseTranslate;
	};
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

<div class="background" use:observeLayout>
	{#if $isMobile}
		<img src="/background_mobile.png" alt="Background" class="background-image" />
	{:else}
		<img src="/background.png" alt="Background" class="background-image" />
	{/if}

	<!-- Rays overlay -->
	<img src="/shop_restock/rays.png" alt="" class="rays" aria-hidden="true" />

	<!-- Vignette overlay -->
	<div class="vignette" aria-hidden="true"></div>

	<!-- Corner overlays -->
	{#if !$isMobile}
		<img src="/left.png" alt="" class="edge edge-left" aria-hidden="true" />
		<img src="/right.png" alt="" class="edge edge-right" aria-hidden="true" />
	{/if}

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
					imageWidth={widthFor(i)}
					orderWidth={orderWidthFor(i)}
					orderTransform={orderTransformFor(i, '')}
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

	<!-- Center HUD strip (timer, score, start/shop/restart button) -->
	<CenterStrip
		onOpenModal={$gamePhase === 'running' ? onOpenModal : undefined}
		timerText={fmt(sessionTimeLeftMs)}
		onStartGame={() => game.startGame()}
		onRestartGame={() => game.startGame()}
	/>

	{#if shopOpen}
		<ShopModal {plantsStore} {game} on:close={onCloseModal} on:restock={onRestockFromShop} />
	{/if}

	{#if $gamePhase === 'pre'}
		<InstructionsModal onStart={() => game.startGame()} />
	{/if}

	{#if $gamePhase === 'ended'}
		<EndingModal score={$scoreStore} onRestart={() => game.startGame()} />
	{/if}

	{#if ENABLE_QTE && $reactiveQTESession}
		<!-- Dimmer to block clicks elsewhere while QTE is active -->
		<div class="qte-dimmer" aria-hidden="true"></div>
		<!-- QTE overlay centered using plant's left/top and transform -->
		<div
			class="qte-overlay"
			style="left: {$reactiveQTESession.leftPct}; top: {$reactiveQTESession.topPct}; transform: {$reactiveQTESession.transformCss ??
				'none'}"
		>
			<QTE
				config={$reactiveQTESession.config}
				attempts={3}
				onQTE={() => {}}
				onDone={(successes) => {
					const s = Math.max(0, Math.min(3, Number(successes) || 0));
					const multiplier = s === 0 ? 0.5 : s === 1 ? 1.0 : s === 2 ? 1.5 : 3.0;
					const plantKey = $reactiveQTESession?.plantKey;
					if (plantKey) game.restockPlantWithMultiplier(plantKey, multiplier);
					activeQTESession.set(null);
				}}
			/>
		</div>
	{/if}
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

	.rays {
		position: absolute;
		left: 50%;
		top: 0;
		transform: translateX(-50%);
		z-index: 1;
		pointer-events: none;
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

	@container (max-width: 640px) {
		.mascot {
			width: 30%;
			left: 33%;
			top: 43%;
			z-index: 100;
		}
	}
	@container (max-width: 400px) {
		.mascot {
			width: 43%;
			left: 27%;
			top: 43%;
			z-index: 100;
		}
	}
</style>
