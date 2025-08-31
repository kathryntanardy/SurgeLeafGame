<script lang="ts">
	import Bucket from './Bucket.svelte';
	import CenterStrip from './CenterStrip.svelte';
	import { bucketData } from '$lib/game/bucketData';
	import Customer from '$lib/components/Customer.svelte';
	import ShopModal from '$lib/components/ShopModal.svelte';
	import {
		OrderStatus,
		orderEntities,
		game,
		displaySlots,
		plantsStore,
		mascotFrame
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

	const leftFor = (i: number) => (i === 0 ? '31.8vw' : i === 1 ? '46.78vw' : '60.48vw');
	const topFor = (i: number) => (i === 0 ? '20.34vh' : i === 1 ? '17.76vh' : '19.33vh');
</script>

<div class="background">
	<img src="/background.png" alt="Background" class="background-image" />

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
					left={leftFor(i)}
					top={topFor(i)}
					imageWidth="7.71vw"
					imageHeight="16.67vh"
					mirror={i === 0}
					on:click={() => game.deliverPlant(ent.id)}
				/>
			{/if}
		{/if}
	{/each}

	{#if $mascotFrame === 'success'}
		<img src="/mascot/success.png" alt="Mascot" class="mascot" />
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
