import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';

// https://github.com/reactjs/redux/blob/master/rollup.config.js
// do i need to prefis rollup ./node_modules/.bin/rollup
const env = process.env.NODE_ENV;
const config = {
  input: 'src/index.js',
  plugins: [
    eslint({
      throwOnError: true,
      exclude: 'node_modules/**',
    }),
  ],
};

if (env === 'es' || env === 'cjs') {
  config.output = { format: env };
  config.plugins.push(babel({
    plugins: ['external-helpers'],
    exclude: 'node_modules/**',
  }));
} else {
  config.output = {
    file: '.bundle.js',
    format: 'umd',
    name: 'myBundle',
  };
  config.plugins.push(
    resolve({
      jsnext: true,
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    })
  );
}

export default config;
