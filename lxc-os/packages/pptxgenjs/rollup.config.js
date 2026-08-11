const pkg = require("./package.json");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("rollup-plugin-typescript2");
const ts = require("typescript");

const nodeBuiltinsRE = /^node:.*/;

module.exports = {
	input: "src/pptxgen.ts",
	output: [
		{
			file: "./dist/pptxgen.js",
			format: "iife",
			name: "PptxGenJS",
			globals: { jszip: "JSZip" },
		},
		{ file: "./dist/pptxgen.cjs.js", format: "cjs", exports: "default" },
		{ file: "./dist/pptxgen.es.js", format: "es" },
	],
	external: [
		nodeBuiltinsRE,
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
	],
	plugins: [
		typescript({
			typescript: ts,
			check: false,
			include: ["src/**/*.ts"],
			tsconfigOverride: {
				compilerOptions: {
					declaration: false,
				}
			}
		}),
		resolve({ preferBuiltins: true }),
		commonjs(),
	]
};
