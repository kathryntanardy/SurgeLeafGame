import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	preprocess: vitePreprocess(),
	// *HERE* add this compilerOptions to filter out a11y warnings
	compilerOptions: {
		warningFilter: (w) => {
			return !w.code.includes("a11y")
		}
	},
	kit: {
		adapter: adapter(),
	}
};

export default config;