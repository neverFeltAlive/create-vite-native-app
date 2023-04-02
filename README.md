# Create Vite application for pug projects with native js

This is a utility package used to automate Vite configuration with npm command.
It uses a custom Vite project [template](https://github.com/neverFeltAlive/vite-pug).

For more details check out [the GitHub repo](https://github.com/neverFeltAlive/vite-pug)

## Usage

### Creating new project
You can simply run a npx command:
```bash
npx create-vite-native-app
```
This command will create a preconfigured vite project from [this GitHub repo](https://github.com/neverFeltAlive/vite-pug)

### Creating new component
To create a new component in the current project run 
```bash
npx create-vite-native-app --component
```
This command will create a new folder under /src/components/ with a specified name.
It will also prompt you with a couple of options:
- you can choose to include js files and style files
- you can choose what file types to use for your styles (css / scss / sass)

If you've chosen to create files for styles and javascript it will try to import them in /utils/main.scss and /utils/main.js accordingly

### Creating new page
To create a new page in the current project run 
```bash 
npx create-vite-native-app --page
```
This command will create a new folder under /src/pages. It will also let you configure your page similar to a component command.
Note that js and style files will not be imported automatically unlike components' styles and js.
