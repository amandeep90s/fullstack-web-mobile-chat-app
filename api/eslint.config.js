import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default [
	{ ignores: ["node_modules/", "dist/"] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	prettierConfig,
	{
		plugins: { prettier: prettierPlugin },
		rules: {
			"prettier/prettier": "warn",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
];
