<script lang="ts">
	import Qte from '$lib/components/QTE.svelte';

	// Code
</script>

<div class="wrapper">
	<Qte
		onQTE={(val) => {
			alert(val);
		}}
		config={{
			count: 2,
			duration: 4,
			major: 0.5,
			minor: 0.5,
			majorMod: 1,
			minorMod: 0.5
		}}
	/>
</div>

<style>
	.wrapper {
		margin: 4rem;
	}
</style>
