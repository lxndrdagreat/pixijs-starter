import type { UserConfig } from "vite";

export default {
	resolve: {
		alias: {
			"@": "/src",
		},
	},
} satisfies UserConfig;
