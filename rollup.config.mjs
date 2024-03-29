import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "./src/index.js",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
      },
      {
        file: "dist/index.es.js",
        format: "es",
        exports: "named",
      },
    ],
    plugins: [
      postcss({
        plugins: [],
        minimize: true,
      }),
      babel({
        exclude: ["node_modules/**", "storybook-static/**"],
        presets: ["@babel/preset-react"],
      }),
      external(),
      resolve({ preferBuiltins: true, mainFields: ["browser"] }),
      commonjs({
        exclude: "src/**",
      }),
      terser(),
    ],
  },
];
