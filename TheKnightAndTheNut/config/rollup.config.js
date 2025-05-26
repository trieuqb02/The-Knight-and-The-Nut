import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./firebase-wrapper.ts",
  output: {
    file: "dist/firebase-bundle.js",
    format: "iife",
    name: "FirebaseBundle",
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: "../tsconfig.json" }),
  ],
};
