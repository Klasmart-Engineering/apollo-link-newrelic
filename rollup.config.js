import pkg from "./package.json";
import swc from "rollup-plugin-swc";
import dts from "rollup-plugin-dts";
import resolve from "@rollup/plugin-node-resolve";

const defaultOptions = {
    input: "src/index.ts",
    external: (id) => !/^[./]/.test(id),
};

export default [
    {
        ...defaultOptions,
        output: [
            { file: pkg.main, format: "cjs", sourcemap: true },
            { file: pkg.module, format: "es", sourcemap: true },
        ],
        plugins: [swc({ sourceMaps: true }), resolve({ extensions: [".ts"] })],
    },
    {
        ...defaultOptions,
        output: {
            file: pkg.types,
            format: "es",
        },
        plugins: [dts()],
    },
];
