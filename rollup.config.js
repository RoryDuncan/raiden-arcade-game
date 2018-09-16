// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    name: "game",
    file: 'public/bundle.js',
    format: 'iife'
  }
};