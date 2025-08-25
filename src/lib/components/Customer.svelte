<script lang="ts">
	import Order from '$lib/components/Order.svelte';
	import { OrderStatus } from '$lib/game/LeafGame';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Default/base image shown when no state mapping applies
	export let imageSrc: string = '/customer.png';
	export let alt: string = 'Customer';

	// Size (viewport-relative preferred)
	export let imageWidth: string = '12vw';
	export let imageHeight: string | undefined = 'auto';

	// Absolute positioning within parent
	export let left: string | undefined = undefined;
	export let top: string | undefined = undefined;

	// Flip image horizontally if true
	export let mirror: boolean = false;

	// Current visual state
	export let state: OrderStatus = OrderStatus.InProgress;

	// Order text (simple, text-only for now)
	export let orderText: string = 'worm x2, tomato x1';

	// Gap between bottom of order and top of customer
	export let orderGapY: string = '3vh';

	// Measured order height from child via bind
	let measuredOrderHeight = 0;

	// Compute order top such that: bottom(order) = top(customer) - orderGapY
	// => top(order) = top(customer) - measuredOrderHeight - orderGapY
	$: orderTop = top ? `calc(${top} - ${measuredOrderHeight}px - ${orderGapY})` : undefined;

	// Center order horizontally over the customer: left + (imageWidth/2) - (orderWidth/2)
	// Order has fixed width 88px, so subtract 44px
	$: orderLeft = left && imageWidth ? `calc(${left} + (${imageWidth}) / 2 - 44px)` : left;

	const defaultMap: Record<OrderStatus, string> = {
		[OrderStatus.InProgress]: '/customer/default.png',
		[OrderStatus.Success]: '/customer/success.png',
		[OrderStatus.Fail]: '/customer/failure.png'
	};

	// Always use static images from /customer/* based on state, fallback to imageSrc
	$: resolvedSrc = defaultMap[state] ?? imageSrc;
</script>

<!-- Order bubble/card above the customer, centered horizontally over the image -->
<Order left={orderLeft} top={orderTop} bind:height={measuredOrderHeight}>
	{orderText}
</Order>

<div class="customer" style:left style:top on:click={() => dispatch('click')}>
	<img
		src={resolvedSrc}
		{alt}
		class="customer-img"
		class:mirrored={mirror}
		style:width={imageWidth}
		style:height={imageHeight}
		draggable="false"
	/>
</div>

<style>
	.customer {
		position: absolute;
		display: block;
	}
	.customer-img {
		display: block;
		height: auto;
	}
	.customer-img.mirrored {
		transform: scaleX(-1);
		transform-origin: center;
	}
</style>
