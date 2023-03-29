#!/usr/bin/env node

const { execSync } = require('child_process');
const { program } = require('commander');
const prompts = require('prompts');
const { unlinkSync, writeFile } = require('fs');
const { join, resolve, basename } = require('path');

// Configure Commander options
program
  .option('--no-index-page, -i', 'project will be configured to autogenerate index page');

// Get user options
program.parse(process.argv);
const options = program.opts();

(async () => {
  let repoName = program.args[0];

  // If project name is not specified
  if (repoName === undefined) {
    let userPrompt = await projectNamePrompt();

    repoName = userPrompt.projectName;
  }

  // Prompt user for index page options
  if (!options.indexPage) {
    const userPrompt = await indexPagePrompt();
    options.indexPage = userPrompt.index;
  }

  const gitCheckoutCommand = `git clone --depth 1 https://github.com/neverFeltAlive/vite-pug.git ${repoName}`;
  const installDepsCommand = `cd ${repoName} && npm install`;

  // Create project
  console.log(`Creating a project: ${repoName === '.' ? basename(process.cwd()) : repoName}`);
  const checkOut = runCommand(gitCheckoutCommand);
  if (!checkOut) process.exit(-1);

  // Configure pages plugin
  configurePages(options.indexPage, repoName);

  // Install dependencies
  console.log(`Installing dependencies`);
  const installedDeps = runCommand(installDepsCommand);
  if (!installedDeps) process.exit(-1);
})();


/**
 * Executes command in node environment
 * @param command
 * @return {boolean}
 */
function runCommand(command) {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    return false;
  }
  return true;
};

/**
 * Prompts user with index page options
 * @return {Promise<*>}
 */
async function indexPagePrompt() {
  return await prompts({
    type: 'toggle',
    name: 'index',
    message: 'Do you want to generate index page automatically?',
    initial: true,
    active: 'yes',
    inactive: 'no',
  });
}

/**
 * Prompts user with index page options
 * @return {Promise<*>}
 */
async function projectNamePrompt() {
  const cwd = basename(process.cwd());
  const defaultValue = '.';

  const result = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'What is the name of your project? (Current directory will be used by default)',
        initial: defaultValue,
      },
      {
        type: 'confirm',
        name: 'isConfirmed',
        message: (prev) => prev === defaultValue ? 'To use the current directory make sure that it is empty. Continue?' : `Please confirm the name of the project: ${prev}`,
        initial: true,
      },
    ],
    {
      onCancel: () => process.exit(-1),
    },
  );

  if ((result.projectName === defaultValue && !result?.isConfirmed) || !result?.isConfirmed) {
    return await projectNamePrompt();
  }

  return result;
}

/**
 * Generates json config file for pages plugin
 * @param enableIndexPage
 * @param dir
 */
function configurePages(enableIndexPage, dir) {
  const json = {
    enableIndexPage,
  };

  const cwd = dir === '.' ? resolve(process.cwd()) : resolve(process.cwd(), dir);
  if (!enableIndexPage) {
    const indexPagePath = resolve(cwd, 'src', 'pages');
    unlinkSync(join(indexPagePath, 'index.js'));
    unlinkSync(join(indexPagePath, 'index.pug'));
    unlinkSync(join(indexPagePath, 'pages.json'));
  }

  writeFile(join(cwd, 'pagesconfig.json'), JSON.stringify(json), 'utf8', (error) => {
    error && console.error('Failed to configure pages plugin', error);
    process.exit(-1);
  });
}
