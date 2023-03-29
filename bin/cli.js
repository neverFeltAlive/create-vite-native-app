#!/usr/bin/env node

const { execSync } = require('child_process');
const { program } = require('commander');
const prompts = require('prompts');
const { unlink, writeFile } = require('fs');
const { resolve } = require('path');

// Configure Commander options
program
    .option('--no-index-page, -i', 'project will be configured to autogenerate index page')

// Get user options
program.parse(process.argv);
const options = program.opts();

// Prompt user for index page options
if (!options.indexPage){
  const userPrompt = await indexPagePrompt();
  options.indexPage = userPrompt.index;
}

const repoName = program.args[0];
const gitCheckoutCommand = `git clone --depth 1 https://github.com/neverFeltAlive/vite-pug.git ${repoName}`;
const installDepsCommand = `cd ${repoName} && npm install`;

// Configure pages plugin
configurePages(options.indexPage);

// Create project
console.log(`Creating a project: ${repoName}`);
const checkOut = runCommand(gitCheckoutCommand);
if (!checkOut) process.exit(-1);

// Install dependencies
console.log(`Installing dependencies`);
const installedDeps = runCommand(installDepsCommand);
if (!installedDeps) process.exit(-1);


/**
 * Executes command in node environment
 * @param command
 * @return {boolean}
 */
function runCommand (command) {
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
async function indexPagePrompt () {
  return await prompts({
    type: 'multiselect',
    name: 'index',
    message: 'Do you want to generate index page automatically?',
    choices: [
      { title: 'Yes (each time a project is build the index page will be automatically generated)', value: true},
      { title: 'No (no index page will be generated)', value: false},
    ]
  });
}

function configurePages (enableIndexPage) {
  const json = {
    enableIndexPage
  }

  if (!enableIndexPage){
    const indexPagePath = resolve(__dirname, 'src', 'pages');
    unlink(indexPagePath + 'index.js', () => {});
    unlink(indexPagePath + 'index.pug', () => {});
    unlink(indexPagePath + 'pages.json', () => {});
  }

  writeFile('pagesconfig.json', JSON.stringify(json), 'utf8', (error) => {
    error && console.error('Failed to configure pages plugin', error);
    process.exit(-1);
  })
}
