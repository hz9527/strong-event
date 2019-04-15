const path = require('path');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');

const isProd = process.env.NODE_ENV === 'production';
console.log(isProd);

const resolve = (p = '') => path.join(__dirname, '../', p);

const tem = (() => {
  const plugins = [
    babel(),
    nodeResolve(),
    commonjs(),
  ];
  if (isProd) {
    const { terser } = require('rollup-plugin-terser'); // eslint-disable-line global-require,import/no-unresolved
    plugins.push(terser());
  }
  return function temFactory(name, input, file, template, format = 'cjs') {
    return {
      name,
      config: {
        inputOpt: { input, plugins },
        outputOpt: { file, format, sourcemap: true },
        template,
      },
    };
  };
})();

const projects = [
  {
    name: 'strongEventDemo',
    input: '/demo/demo.js',
    file: 'demo.js',
    template: '/demo/index.html',
  },
];
const CONF = {
  inputBaseUrl: resolve('./src'),
  fileDefaultDir: resolve('./src/dist'),
  projects: isProd ? [{
    name: 'strongEvent',
    input: '/index.js',
    file: 'strong_event.js',
    output: resolve('./dist'),
  }].concat(projects) : projects,
};

module.exports = CONF.projects.map(item => tem(
  item.name,
  CONF.inputBaseUrl + item.input,
  `${item.output ? item.output : CONF.fileDefaultDir}/${item.file}`,
  CONF.inputBaseUrl + item.template,
));
