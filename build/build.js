const rollup = require('rollup');
const Configs = require('./config.js');

async function build(inputOpt, outputOpt) {
  const bundle = await rollup.rollup(inputOpt);
  await bundle.generate(outputOpt);
  await bundle.write(outputOpt);
}

Configs.forEach(({ name, config: { inputOpt, outputOpt } }) => {
  build(inputOpt, outputOpt)
    .then(
      () => console.log(`build ${name} successful`),
      (err) => {
        console.log(`build ${name} fail`);
        console.log(err);
      },
    );
});
