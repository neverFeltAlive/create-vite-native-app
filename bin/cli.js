#!/usr/bin/env node

import { program } from 'commander';
import { createElement } from './createElement.js';
import { createProject } from './createProject.js';

// Configure Commander options
program
  .option('--no-index-page, -i', 'project will be configured to autogenerate index page')
  .option('--component, -c', 'create a components for an existing project')
  .option('--page, -p', 'create a page for an existing project');

// Get user options
program.parse(process.argv);
const options = program.opts();

(async () => {
  console.clear();
  let commandArg = program.args[0];

  if (options.P || options.C) {
    // Exit if both options were passed
    if (options.P && options.C) {
      console.error('Invalid options');
      process.exit(-1);
    }

    try {
      await createElement(commandArg, options);
    } catch (e) {
      console.error(e);
    }
  } else {
    await createProject(commandArg, options);
  }
})();