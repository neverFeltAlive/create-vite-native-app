import prompts from 'prompts'

/**
 * Prompts user with index page options
 * @return {Promise<*>}
 */
export async function projectNamePrompt() {
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
 * Prompts user with index page options
 * @return {Promise<*>}
 */
export async function indexPagePrompt() {
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
 * Prompts user with wrong architecture warning
 * @return {Promise<*>}
 */
export async function wrongArchitecturePrompt() {
  return await prompts(
    [
      {
        type: 'confirm',
        name: 'isConfirmed',
        message: 'Your project seems to have an unsupported architecture. Do you wish to continue?',
        initial: false
      }
    ]
  )
}

/**
 * Prompts user with options for a generated component
 * @param isPage - true if the element is a page
 * @return {Promise<*>}
 */
export async function elementPrompts(isPage = false){
  const options = await prompts(
    [
      {
        type: 'multiselect',
        name: 'componentOptions',
        message: `Choose ${isPage ? 'page' : 'component'} options`,
        choices: [
          {
            title: 'Styles',
            value: 'style'
          },
          {
            title: 'JavaScript',
            value: 'js',
          }
        ]
      }
    ]
  );

  if (options.componentOptions.includes('style')){
    const styleType = await prompts([
      {
        type: 'select',
        name: 'styleType',
        message: 'Which styles do you want to use?',
        choices: [
          {
            title: 'SCSS',
            value: 'scss',
          },
          {
            title: 'SASS',
            value: 'sass'
          },
          {
            title: 'CSS',
            value: 'css'
          }
        ],
        initial: 0,
      }
    ]);
    options.styleType = styleType.styleType;
  }

  return options;
}

/**
 * Prompts user for component / page options
 * @param options
 * @return {Promise<*|{}>}
 */
export async function elementNamePrompts(options){
  return await prompts(
    [
      {
        type: 'text',
        name: 'value',
        message: `What is the name of the ${!options.P ? 'component' : 'page'}?`,
        initial: 'newComponent'
      }
    ]
  )
}
