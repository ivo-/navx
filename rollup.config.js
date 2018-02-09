import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';

const env = process.env.NODE_ENV;
const config = {
  input: 'src/index.js',
  plugins: [
    eslint({
      throwOnError: true,
      exclude: 'node_modules/**',
    }),
    resolve({
      jsnext: true,
    }),
    babel({
      plugins: ['external-helpers'],
      exclude: 'node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
};

if (env === 'es' || env === 'cjs') {
  config.output = { format: env };
} else {
  config.output = {
    file: '.bundle.js',
    format: 'umd',
    name: 'myBundle',
  };
}

export default config;
