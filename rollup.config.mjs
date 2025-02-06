import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'docs',
    format: 'iife',
    intro: `const VERSION = "${process.env.npm_package_version}";`,
  },
  plugins: [typescript()]
};