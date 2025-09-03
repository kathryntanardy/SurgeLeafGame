<script lang="ts">
	import Order from '$lib/components/Order.svelte';
	import { OrderStatus } from '$lib/game/LeafGame';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Default/base image shown when no state mapping applies
	export let imageSrc: string = '/customer.png';
	export let alt: string = 'Customer';

	// Size (viewport-relative preferred)
	export let imageWidth: string = '8%';

	// Absolute positioning within parent
	export let left: string | undefined = undefined;
	export let top: string | undefined = undefined;

	// Flip image horizontally if true
	export let mirror: boolean = false;

	// Current visual state
	export let state: OrderStatus = OrderStatus.InProgress;
	// Optional timer/hurry indicators
	export let timerRatio: number | undefined = undefined; // 1..0 remaining
	export let hurry: boolean | undefined = undefined;

	// Order text (simple, text-only for now)
	export let orderText: string = 'worm x2, tomato x1';
	// Optional: rich items to render icons instead of text
	export let orderItems: Record<string, number> | undefined = undefined;
	// Optional thanks amount to render in the same order bubble position after success
	export let thanksAmount: number | null = null;

	// Gap between bottom of order and top of customer (use vw only; 1vh ≈ 0.5625vw at 16:9)
	export let orderGapY: string = '5%';

	// Anchor order bubble to customer using translate, so it shrinks from top to bottom
	// We place the order at customer top and translate upward by gap
	const translateY = `calc(-100% - ${orderGapY})`;
	$: orderTop = top; // top is the customer's top; translation handles the gap

	// Center order horizontally over the customer: left + (imageWidth/2) - (orderWidth/2)
	// Order width uses responsive 4.5833vw (~88px @1920)
	$: orderLeft = left && imageWidth ? `calc(${left} + (${imageWidth}) / 2 - 2.2916666667vw)` : left;

	const defaultMap: Record<OrderStatus, string> = {
		[OrderStatus.InProgress]: '/customer/default.png',
		[OrderStatus.Success]: '/customer/success.png',
		[OrderStatus.Fail]: '/customer/failure.png'
	};

	// Use unhappy face pre-emptively when hurrying
	$: resolvedSrc =
		state === OrderStatus.InProgress && hurry
			? '/customer/failure.png'
			: (defaultMap[state] ?? imageSrc);

	// Icon mapping for order items
	const iconByKey: Record<string, string> = {
		plant1: '/icons/monstera.png',
		plant2: '/icons/vine.png',
		plant3: '/icons/tomato.png',
		plant4: '/icons/stick.png',
		plant5: '/icons/carrot.png',
		plant6: '/icons/dandelion.png'
	};
</script>

<!-- Order bubble/card: show normal order while in progress; show Thanks when provided -->
{#if thanksAmount != null}
	<Order left={orderLeft} top={orderTop} {translateY} progress={undefined}>
		<div class="thanks-wrap">
			<div class="thanks-title">Thanks!</div>
			<div class="thanks-amount"><img src="/leafIcon.png" alt="" /> {thanksAmount}</div>
		</div>
	</Order>
{:else if state === OrderStatus.InProgress}
	<Order left={orderLeft} top={orderTop} {translateY} progress={timerRatio}>
		{#if orderItems}
			<div class="order-icons">
				{#each Object.entries(orderItems) as [k, qty]}
					<div class="order-icon-item">
						<img src={iconByKey[k]} alt={k} class="order-icon" draggable="false" />
						<span class="order-qty">x{qty}</span>
					</div>
				{/each}
			</div>
		{:else}
			{orderText}
		{/if}
	</Order>
{/if}

<!-- Invisible hitbox above plants to keep customer clickable -->
<div
	class="customer-hit"
	style:left
	style:top
	style:width={imageWidth}
	style:height={imageWidth}
	on:click={() => dispatch('click')}
></div>

<div
	class="customer"
	style:left
	style:top
	style:width={imageWidth}
	on:click={() => dispatch('click')}
>
	<img
		src={resolvedSrc}
		{alt}
		class="customer-img"
		class:mirrored={mirror}
		style:width="100%"
		draggable="false"
	/>
</div>

<style>
	.customer {
		position: absolute;
		display: block;
		z-index: 1; /* below plants */
	}
	.customer-hit {
		position: absolute;
		z-index: 5; /* above plants */
		background: transparent;
	}
	.customer-img {
		display: block;
		height: auto;
	}
	.customer-img.mirrored {
		transform: scaleX(-1);
		transform-origin: center;
	}
	.order-icons {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 6px;
		align-items: center;
		justify-content: center;
		/* Use vw only: 35px ~= 1.8229166667vw @1920w */
		--iconSize: 1.8229166667vw;
	}
	.order-icon-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: var(--iconSize);
	}
	.order-icon {
		width: var(--iconSize);
		height: var(--iconSize);
		object-fit: contain;
		display: block;
	}
	.order-qty {
		color: #8a6f6a;
		line-height: 1;
	}
	.thanks-wrap {
		display: grid;
		gap: 0rem;
		place-items: center;
	}
	.thanks-title {
		padding-top: 0.4rem;
		font-size: 0.8cqw;
		font-weight: 400;
	}
	.thanks-amount {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 1.2cqw;
		font-weight: 500;
	}
	.thanks-amount img {
		width: 1cqw;
		height: 1cqw;
	}
</style>
