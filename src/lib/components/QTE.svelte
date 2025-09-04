<script module lang="ts">
	export interface QTEProps {
		onQTE: (val: number) => void;
		onDone?: (successes: number) => void; // fires after attempts are exhausted
		attempts?: number; // number of clicks in a session (default 3)
		sizeCqw?: number; // optional: size in cqw; height equals width
		config: {
			duration: number; // how long is the entire qte circle, in s
			count: number; // how many hot spots
			major: number;
			minor: number; // duration of the major and minor modifier, in s.
			majorMod: number;
			minorMod: number; // multiplier for hitting major or minor
		};
	}
</script>

<script lang="ts">
	let { onQTE, onDone, attempts = 3, sizeCqw, config }: QTEProps = $props();

	// Do not mutate incoming config; build arcs from a local counter
	let arcs = $derived.by(() => {
		const _arcs: number[] = [];
		let tries = 100;
		let remain = Math.max(0, config.count);
		while (tries > 0 && remain > 0) {
			tries--;
			const cand = Math.random() * config.duration;
			let legal = true;
			for (const a of _arcs) {
				if (Math.abs(a - cand) < config.minor + config.major) {
					legal = false;
					break;
				}
			}
			if (legal) {
				_arcs.push(cand);
				remain--;
			}
		}
		return _arcs;
	});

	let timer = $state(0);
	let rafId: number | null = null;
	let clicks = $state(0);
	let successes = $state(0);
	let sessionDone = $state(false);

	function updateTimer(t: number) {
		if (sessionDone) return;
		timer = (t % (config.duration * 1000)) / 1000;
		rafId = requestAnimationFrame(updateTimer);
	}

	$effect(() => {
		rafId = requestAnimationFrame(updateTimer);
		return () => {
			if (rafId != null) cancelAnimationFrame(rafId);
			rafId = null;
		};
	});

	// Dynamic geometry based on actual button size (px)
	let btnRef: HTMLButtonElement | null = null;
	let btnSizePx = $state(80);
	$effect(() => {
		if (!btnRef) return;
		const ro = new ResizeObserver((entries) => {
			const cr = entries[0]?.contentRect;
			if (cr) btnSizePx = cr.width;
		});
		ro.observe(btnRef);
		return () => ro.disconnect();
	});

	function buildArc(center: number, range: number) {
		const centerOffset = btnSizePx / 2;
		// Scale from original baseline (80px button): radius ≈ 38.5px → centerOffset - 1.5px (1.5/80)
		const RADIUS_INSET_FRAC = 0.01875;
		// Thickness 10px on 80px → 0.125
		const THICKNESS_FRAC = 0.125;
		const thickness = Math.max(6, btnSizePx * THICKNESS_FRAC);
		const radius = Math.max(0, centerOffset - btnSizePx * RADIUS_INSET_FRAC);
		let out = '';
		const ca = (center / config.duration) * Math.PI * 2;
		const ra = (range / config.duration) * Math.PI * 2;
		out += `M ${centerOffset + Math.sin(ca - ra) * radius} ${centerOffset - Math.cos(ca - ra) * radius} `;
		out += `A ${radius} ${radius} 0 0 1 ${centerOffset + Math.sin(ca + ra) * radius} ${centerOffset - Math.cos(ca + ra) * radius} `;
		out += `L ${centerOffset + Math.sin(ca + ra) * (radius - thickness)} ${centerOffset - Math.cos(ca + ra) * (radius - thickness)}`;
		out += `A ${radius - thickness} ${radius - thickness} 0 0 0 ${centerOffset + Math.sin(ca - ra) * (radius - thickness)} ${centerOffset - Math.cos(ca - ra) * (radius - thickness)} `;
		return out;
	}

	// Build a full donut ring path that matches the arc band geometry
	function buildRingPath() {
		const centerOffset = btnSizePx / 2;
		const RADIUS_INSET_FRAC = 0.01875; // 1.5/80
		const THICKNESS_FRAC = 0.125; // 10/80
		const outerR = Math.max(0, centerOffset - btnSizePx * RADIUS_INSET_FRAC);
		const innerR = Math.max(0, outerR - btnSizePx * THICKNESS_FRAC);

		let out = '';
		// Start at angle 0 on outer radius
		const a0 = 0;
		const a1 = Math.PI; // 180 deg
		const a2 = Math.PI * 2; // 360 deg
		out += `M ${centerOffset + Math.sin(a0) * outerR} ${centerOffset - Math.cos(a0) * outerR} `;
		// Outer two half-arcs (clockwise)
		out += `A ${outerR} ${outerR} 0 1 1 ${centerOffset + Math.sin(a1) * outerR} ${centerOffset - Math.cos(a1) * outerR} `;
		out += `A ${outerR} ${outerR} 0 1 1 ${centerOffset + Math.sin(a2) * outerR} ${centerOffset - Math.cos(a2) * outerR} `;
		// Join to inner radius
		out += `L ${centerOffset + Math.sin(a2) * innerR} ${centerOffset - Math.cos(a2) * innerR} `;
		// Inner two half-arcs (counter-clockwise to close)
		out += `A ${innerR} ${innerR} 0 1 0 ${centerOffset + Math.sin(a1) * innerR} ${centerOffset - Math.cos(a1) * innerR} `;
		out += `A ${innerR} ${innerR} 0 1 0 ${centerOffset + Math.sin(a0) * innerR} ${centerOffset - Math.cos(a0) * innerR} `;
		return out;
	}

	function finishIfNeeded() {
		if (clicks >= attempts && !sessionDone) {
			sessionDone = true;
			if (rafId != null) cancelAnimationFrame(rafId);
			rafId = null;
			if (onDone) onDone(successes);
		}
	}

	function checkClick() {
		if (sessionDone) return;
		let majorHit = false;
		let minorHit = false;
		for (const a of arcs) {
			if (Math.abs(a - timer) < config.major / 2) {
				majorHit = true;
				break;
			}
		}
		if (!majorHit) {
			for (const a of arcs) {
				if (Math.abs(a - timer) < (config.major + config.minor) / 2) {
					minorHit = true;
					break;
				}
			}
		}
		if (majorHit) onQTE(config.majorMod);
		else if (minorHit) onQTE(config.minorMod);
		if (majorHit || minorHit) successes = successes + 1;
		clicks = clicks + 1;
		finishIfNeeded();
	}
</script>

<div class="qteContainer" style={sizeCqw != null ? `--container-size:${sizeCqw}cqw;` : ''}>
	<button
		bind:this={btnRef}
		class="qteBtn"
		style="--angle:{((timer / config.duration) * 360).toFixed(2)}deg;"
		onclick={() => {
			checkClick();
		}}
	>
		<img src="/finger.png" alt="finger" />
		{#each arcs as center}
			<div
				class="arc"
				style="--path: '{buildArc(center, config.major / 2)}'; --color: var(--border2); z-index: 2;"
			></div>

			<div
				class="arc"
				style="--path: '{buildArc(
					center,
					(config.minor + config.major) / 2
				)}'; --color: var(--border); z-index: 1;"
			></div>
		{/each}

		<!-- Full ring matching arc geometry, rendered under segments -->
		<div
			class="arc full-ring"
			style="--path: '{buildRingPath()}'; --color: var(--border); z-index: 0;"
		></div>
	</button>
</div>

<style>
	* {
		image-rendering: smooth;
	}

	.qteContainer {
		position: relative;

		/* Map original ~90px container to 5.5cqw */
		--container-size: 5.5cqw;
		/* Original button was 80px inside 90px container → 80/90 ≈ 0.8889 */
		--btn-size: calc(var(--container-size) * 0.8888889);
		width: var(--container-size);
		height: var(--container-size);

		background-color: var(--bg-trans);
		border-radius: 50%;
	}

	.arc {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		background-color: var(--color);
		width: var(--btn-size);
		height: var(--btn-size);

		clip-path: path(var(--path));
	}

	.qteBtn {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;

		width: var(--btn-size);
		height: var(--btn-size);

		background-color: var(--bg);
		/* Original 2px border at 80px → 2/80 = 0.025 */
		border: calc(var(--btn-size) * 0.025) solid var(--border);

		cursor: pointer;
	}

	/* inner ring */
	.qteBtn::before {
		content: '';

		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		/* Make inner ring diameter smaller (increase subtraction factor) */
		width: calc(100% - (var(--btn-size) * 0.22));
		height: calc(100% - (var(--btn-size) * 0.22));

		/* 2px at 80px → 0.025 */
		border: calc(var(--btn-size) * 0.025) solid var(--border);
		border-radius: 50%;

		z-index: 5;
	}

	.qteBtn::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform-origin: center;
		transform: translate(-50%, -50%) rotate(var(--angle));

		/* Sweep width 4px at 80px → 0.05; extra height +6px at 80px → 0.075 */
		width: calc(var(--btn-size) * 0.05);
		height: calc(100% + (var(--btn-size) * 0.075));

		box-sizing: border-box;
		/* 18px at 80px → 0.225 */
		border-top: calc(var(--btn-size) * 0.225) solid var(--header);

		z-index: 10;
	}

	.qteBtn > img {
		/* Scale icon together with QTE size */
		width: calc(var(--btn-size) * 0.5);
		height: calc(var(--btn-size) * 0.5);

		position: absolute;
		left: 46%;
		top: 47%;

		transform: translate(-50%, -50%);
		z-index: 20;
		pointer-events: none;
	}
</style>
