const { basename, join, resolve } = require('path');
const { execSync } = require('child_process');
const { unlinkSync, writeFile } = require('fs');
const { projectNamePrompt, indexPagePrompt } = require('./customPrompts');

/**
 * Creates a new project
 * @param commandArg
 * @param options
 * @return {Promise<void>}
 */
async function createProject(commandArg, options) {
  // If project name is not specified
  if (commandArg === undefined) {
    let userPrompt = await projectNamePrompt();

    commandArg = userPrompt.projectName;
  }

  // Prompt user for index page options
  if (!options.I) {
    const userPrompt = await indexPagePrompt();
    options.I = userPrompt.index;
  }

  const gitCheckoutCommand = `git clone --depth 1 https://github.com/neverFeltAlive/vite-pug.git ${commandArg}`;
  const installDepsCommand = `cd ${commandArg} && npm install`;

  // Create project
  console.log(`Creating a project: ${commandArg === '.' ? basename(process.cwd()) : commandArg}`);
  const checkOut = runCommand(gitCheckoutCommand);
  if (!checkOut) process.exit(-1);

  // Configure pages plugin
  configurePages(options.I, commandArg);

  // Install dependencies
  console.log(`Installing dependencies`);
  const installedDeps = runCommand(installDepsCommand);
  if (!installedDeps) process.exit(-1);
}

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

module.exports.createProject = createProject;