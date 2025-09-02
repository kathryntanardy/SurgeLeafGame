<script module lang="ts">
	export interface QTEProps {
		onQTE: (val: number) => void;
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
	let { onQTE, config }: QTEProps = $props();
	let arcs = $derived.by(() => {
		const _arcs: number[] = [];

		let tries = 100;

		while (tries > 0 && config.count > 0) {
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
				config.count--;
			}
		}

		return _arcs;
	});

	let timer = $state(0);

	function updateTimer(t: number) {
		timer = (t % (config.duration * 1000)) / 1000;
		requestAnimationFrame(updateTimer);
	}

	$effect(() => {
		requestAnimationFrame(updateTimer);
	});

	function buildArc(center: number, range: number) {
		const centerOffset = 40;
		const radius = 38.5; // px
		const thickness = 10;
		let out = '';
		const ca = (center / config.duration) * Math.PI * 2;
		const ra = (range / config.duration) * Math.PI * 2;

		// initial point
		out += `M ${centerOffset + Math.sin(ca - ra) * radius} ${centerOffset - Math.cos(ca - ra) * radius} `;
		// sweep clockwise outer arc
		out += `A ${radius} ${radius} 0 0 1 ${centerOffset + Math.sin(ca + ra) * radius} ${centerOffset - Math.cos(ca + ra) * radius} `;

		out += `L ${centerOffset + Math.sin(ca + ra) * (radius - thickness)} ${centerOffset - Math.cos(ca + ra) * (radius - thickness)}`;

		out += `A ${radius - thickness} ${radius - thickness} 0 0 0 ${centerOffset + Math.sin(ca - ra) * (radius - thickness)} ${centerOffset - Math.cos(ca - ra) * (radius - thickness)} `;
		return out;
	}

	function checkClick() {
		for (const a of arcs) {
			if (Math.abs(a - timer) < config.major / 2) {
				return onQTE(config.majorMod);
			}
		}

		for (const a of arcs) {
			if (Math.abs(a - timer) < (config.major + config.minor) / 2) {
				return onQTE(config.minorMod);
			}
		}
	}
</script>

<div class="qteContainer">
	<button
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
	</button>
</div>

<style>
	* {
		image-rendering: smooth;
	}

	.qteContainer {
		position: relative;

		width: 90px;
		height: 90px;

		background-color: var(--bg-trans);
		border-radius: 50%;
	}

	.arc {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		background-color: var(--color);
		width: 80px;
		height: 80px;

		clip-path: path(var(--path));
	}

	.qteBtn {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;

		width: 80px;
		height: 80px;

		background-color: var(--bg);
		border: 2px solid var(--border);

		cursor: pointer;
	}

	/* inner ring */
	.qteBtn::before {
		content: '';

		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		width: calc(100% - 4px - 11px);
		height: calc(100% - 4px - 11px);

		border: 2px solid var(--border);
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

		width: 4px;
		height: calc(100% + 6px);

		box-sizing: border-box;
		border-top: 18px solid var(--header);

		z-index: 10;
	}

	.qteBtn > img {
		width: 2.75rem;
		height: 2.75rem;

		position: absolute;
		left: 50%;
		top: 50%;

		transform: translate(-50%, -50%);
	}
</style>
