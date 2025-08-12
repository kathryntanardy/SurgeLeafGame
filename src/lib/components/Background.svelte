<script lang="ts">
	// Background component with fixed dimensions and color

	const imgType: string = 'webp';

	function handleBucket1Click() {
		console.log('Bucket 1 clicked!');
		// Add your bucket 1 click logic here
	}

	function handleBucket2Click() {
		console.log('Bucket 2 clicked!');
		// Add your bucket 2 click logic here
	}

	function handleBucket3Click() {
		console.log('Bucket 3 clicked!');
		// Add your bucket 3 click logic here
	}

	function handleBucket4Click() {
		console.log('Bucket 4 clicked!');
		// Add your bucket 4 click logic here
	}

	function handleBucket5Click() {
		console.log('Bucket 5 clicked!');
		// Add your bucket 5 click logic here
	}

	function handleBucket6Click() {
		console.log('Bucket 6 clicked!');
		// Add your bucket 6 click logic here
	}

	function handleBucketKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			// Trigger the same action as click
			const target = event.target as HTMLElement;
			if (target.classList.contains('bucket1')) handleBucket1Click();
			else if (target.classList.contains('bucket2')) handleBucket2Click();
			else if (target.classList.contains('bucket3')) handleBucket3Click();
			else if (target.classList.contains('bucket4')) handleBucket4Click();
			else if (target.classList.contains('bucket5')) handleBucket5Click();
			else if (target.classList.contains('bucket6')) handleBucket6Click();
		}
	}
</script>

<div class="background">
	<img src="/background.png" alt="Background" class="background-image" />
	<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-roles -->
	<img
		src="/bucket1.png"
		alt="Bucket"
		class="bucket bucket1"
		on:click={handleBucket1Click}
		on:keydown={handleBucketKeydown}
		tabindex="0"
		role="button"
	/>
	<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-roles -->
	<img
		src="/bucket2.png"
		alt="Bucket 2"
		class="bucket bucket2"
		on:click={handleBucket2Click}
		on:keydown={handleBucketKeydown}
		tabindex="0"
		role="button"
	/>
	<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-roles -->
	<img
		src="/bucket3.png"
		alt="Bucket 3"
		class="bucket bucket3"
		on:click={handleBucket3Click}
		on:keydown={handleBucketKeydown}
		tabindex="0"
		role="button"
	/>
	<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-roles -->
	<img
		src="/bucket4.png"
		alt="Bucket 4"
		class="bucket bucket4"
		on:click={handleBucket4Click}
		on:keydown={handleBucketKeydown}
		tabindex="0"
		role="button"
	/>
	<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-roles -->
	<img
		src="/bucket5.png"
		alt="Bucket 5"
		class="bucket bucket5"
		on:click={handleBucket5Click}
		on:keydown={handleBucketKeydown}
		tabindex="0"
		role="button"
	/>
	<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-roles -->
	<img
		src="/bucket6.png"
		alt="Bucket 6"
		class="bucket bucket6"
		on:click={handleBucket6Click}
		on:keydown={handleBucketKeydown}
		tabindex="0"
		role="button"
	/>
	<img src="/placeholder_mascot.png" alt="Mascot" class="mascot" />
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

	/* Bucket styles */
	.bucket {
		position: absolute;
		height: auto;
		z-index: 1;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.bucket:hover {
		transform: scale(1.05);
	}

	/* Individual bucket positioning and sizing */
	.bucket1 {
		left: 25.33vw;
		top: 49.13vh;
		width: 8vw;
	}

	.bucket2 {
		left: 35.89vw;
		top: 60.56vh;
		width: 5vw;
	}

	.bucket3 {
		left: 38vw;
		top: 44.04vh;
		width: 6.5vw;
	}

	.bucket4 {
		left: 55.95vw;
		top: 49.15vh;
		width: 4.2vw;
	}

	.bucket5 {
		left: 58.77vw;
		top: 60.28vh;
		width: 10vw;
	}

	.bucket6 {
		left: 67.23vw;
		top: 52.39vh;
		width: 6.5vw;
	}

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
