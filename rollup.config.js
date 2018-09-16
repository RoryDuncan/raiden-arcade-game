// rollup.config.js
import resolve from "rollup-plugin-node-resolve";

export default {
  input: 'src/main.js',
  output: {
    name: "game",
    file: 'public/bundle.js',
    format: 'iife'
  },
  plugins: [
    resolve({
      main: true,
      modulesOnly: true,
    })
  ],
};