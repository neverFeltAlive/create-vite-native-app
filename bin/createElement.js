const { readFileSync, writeFile, existsSync, mkdirSync, readdirSync } = require('fs');
const { join, resolve } = require('path');
const { elementPrompts, wrongArchitecturePrompt, elementNamePrompts } = require('./customPrompts');

/**
 * Created all necessary files for a component / page in an existing project
 * @param commandArg
 * @param options
 * @return {Promise<void>}
 */
async function createElement(commandArg, options){
  const cwd = process.cwd();
  const projectRoot = findRoot(cwd);
  const targetPath = resolve(projectRoot, 'src', options.P ? 'pages' : 'components');

  if (!existsSync(targetPath)) {
    const userPrompts = await wrongArchitecturePrompt();
    if (!userPrompts.isConfirmed){
      process.exit(-1);
    }
  }

  // Ask for a component name if needed
  const name = commandArg || await elementNamePrompts(options);
  const parsedName = name?.value?.trim() || name.trim();
  const dirName = resolve(targetPath, parsedName);

  // Check if directory exists
  if (existsSync(dirName)){
    console.error(`Failed to create ${!options.P ? 'component' : 'page'} ${parsedName}. Directory already exists`);
  }

  // Create new directory
  try {
    mkdirSync(dirName);
  } catch (e) {
    console.error(`Failed to create ${!options.P ? 'component' : 'page'} ${parsedName}`);
    console.error(e);
    process.exit(-1);
  }

  // Get component options
  const elementOptions = await elementPrompts(!!options.P);

  // Create pug file
  writeFile(join(dirName, 'index.pug'), getPugContent(parsedName, options.P), (error) => {
    error && console.error(`Failed to create PUG file: ${error}`);
  })

  // Create optional files
  if (elementOptions.componentOptions.includes('style')){
    writeFile(join(dirName, `style.${elementOptions.styleType}`), ``, (error) => {
      error && console.error(`Failed to create ${elementOptions.styleType.toUpperCase()} file: ${error}`);

      // Link styles
      addComponentStyles(parsedName, projectRoot, elementOptions.styleType, options.P);
    })
  }
  if (elementOptions.componentOptions.includes('js')){
    writeFile(join(dirName, `index.js`), ``, (error) => {
      error && console.error(`Failed to create JS file: ${error}`);

      // Link js
      addComponentJS(parsedName, projectRoot, options.P);
    })
  }
  console.log(`Successfully created ${parsedName} ${!options.P ? 'component' : 'page'}.`)
}

/**
 * Finds project root folder
 * @param dir
 * @returns {string}
 */
function findRoot (dir=__dirname) {
  let ls = readdirSync(dir);
  if(ls.includes('node_modules'))
    return dir;
  else if(dir === resolve('/'))
    throw new Error(`Could not find project root`);
  else
    return findRoot(resolve(dir,'..'));
}

/**
 * Generates string of PUG file for a page
 * @param name - page name
 * @return {string}
 */
function generatePage(name){
  return `extends ../../template.pug
\n
block title
\ttitle ${name}
\n
block content
\th1 ${name}\n`
}

/**
 * Generates PUG file content
 * @param name - name of a component / page
 * @param isPage - if page is being generated
 * @return {string}
 */
function getPugContent(name, isPage = false){
  return isPage ? generatePage(name) : `h1 ${name}`
}

/**
 * Includes components styles to main.scss
 * @param name - component name
 * @param root - project root
 * @param styleType - scss / sass / css
 * @param isPage - if the page is being generated
 */
function addComponentStyles(name, root, styleType, isPage = false){
  try {
    const stylePath = resolve(root, 'src', 'utils');

    const templateDir = readdirSync(stylePath);
    if (templateDir.includes('main.scss')){
      const styleContents = readFileSync(resolve(stylePath, 'main.scss'), 'utf8')
      const newStyleContents = styleContents + generateStyleLink(name, styleType, isPage);
      writeFile(resolve(stylePath, 'main.scss'), newStyleContents, (error) => {
        error && console.error(error);
      })
    } else {
      console.error(`Failed to link styles for your ${isPage ? 'page' : 'component'}: No style file was found`)
    }
  } catch (e) {
    console.error(`Failed to link styles for your ${isPage ? 'page' : 'component'}`);
  }
}

/**
 * Imports components js into main.js file
 * @param name - component name
 * @param root - project root
 * @param isPage - if the page is being generated
 */
function addComponentJS(name, root, isPage = false){
  try {
    const jsPath = resolve(root, 'src', 'utils');

    const templateDir = readdirSync(jsPath);
    if (templateDir.includes('main.js')){
      const newContents = readFileSync(resolve(jsPath, 'main.js'), 'utf8')
      const newJSContents = newContents + generateJSLink(name, isPage);
      writeFile(resolve(jsPath, 'main.js'), newJSContents, (error) => {
        error && console.error(error);
      })
    } else {
      console.error(`Failed to link js for your ${isPage ? 'page' : 'component'}: No js file was found`)
    }
  } catch (e) {
    console.error(`Failed to link js for your ${isPage ? 'page' : 'component'}`);
  }
}

/**
 * Generates string of a style import
 * @param name - component name
 * @param styleType - scss / sass / css
 * @param isPage - if the page is being generated
 * @return {string}
 */
function generateStyleLink(name, styleType, isPage = false) {
  return `\n@import '../${isPage ? 'pages' : 'components'}/${name}/style.${styleType}';\n`;
}

/**
 * Generates js import string
 * @param name - component name
 * @param isPage - if the page is being generated
 * @return {string}
 */
function generateJSLink(name, isPage = false){
  return `\nimport * from '@${isPage ? 'pages' : 'components'}/${name}/index.js';\n`
}


module.exports.createComponent = createElement;

