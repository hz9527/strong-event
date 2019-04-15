const rollup = require('rollup');
const Configs = require('./config.js');
// const express = require('express')
// const path = require('path')
// const fs = require('fs')
//
// const app = new express()

Configs.forEach(({ name, config: { inputOpt, outputOpt } }) => {
  const watchOptions = {
    ...inputOpt,
    cache: true,
    output: [outputOpt],
    watch: {},
  };
  const watcher = rollup.watch(watchOptions);

  watcher.on('event', (event) => {
    if (event.code === 'FATAL') {
      console.log(event, name);
    }
  });
});
