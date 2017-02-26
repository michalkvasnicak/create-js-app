# Create JS App [![CircleCI](https://circleci.com/gh/michalkvasnicak/create-js-app/tree/master.svg?style=svg&circle-token=ea51ecdfaed48e61f96b998f9731896b9ffe4776)](https://circleci.com/gh/michalkvasnicak/create-js-app/tree/master)

Create any javascript application with no build configuration using
your own or predefined project templates and build plugins.

This project is highly influenced by the (https://github.com/facebookincubator/create-react-app)[Create React App]. I thank its authors.

## TL;DR

```
npm install -g create-js-app

create-js-app create my-app
cd my-app/
npm start
```
This will open your application in a browser (or you can navigate to (http://localhost:3000)[http://localhost:3000]).

When you’re ready to deploy to production, create a minified bundle with `npm run build`.

## Disclaimer

This project is currently under occassional development. This means that if I encounter a bug, or if a new simple feature comes to mind, I will be continuing to work on it.

**I am using this project at my work actively with features that are currently available (and these features are all I need for now).**

**You can create your own plugins or templates easily if there is something you miss.**

## Installation

```
# using npm
npm install -g create-js-app

# using yarn
yarn global add create-js-app
```

This command will install `create-js-app` globally.

**You will need to have Node >= 6.0 on you machine**

## Getting started

You have two options of how to create an application. The first one is creating an application using (https://github.com/michalkvasnicak/create-js-app/tree/master/packages/js-app-template-universal)[default project template] (which is using (https://github.com/michalkvasnicak/create-js-app/tree/master/packages/js-app-plugin-universal-webpack)[js-app-plugin-universal-webpack] under the hood) and the second is creating an application using a template of your own choosing.

### 1. Creating an application

#### Create a new project with default template**

```
create-js-app create <project-directory-to-create>
```

This will create a project with default template `js-app-template-universal` which is suitable for creating universal React application.

##### Example

```
create-js-app create my-app
cd my-app/
```

#### Create a new project with custom template

```
create-js-app create <project-directory-to-create> --template <package-name>
```

This will create a project with a template of your own choosing.

##### Example

```
create-js-app create my-app --template js-app-plugin-universal-webpack
cd my-app/
```

### 2. Develop and test the application

There are only two commands you need during the development: `npm run start` and `npm run test`.

#### Development mode

First you need to develop your application. To start the development mode you need to run following command in a project directory.

```
npm start
```

This will start your application. If you are using default project template then it opens the application in your browser.

#### Test mode

During development you may need to test your application. In this case use the following command.

```
npm test
```

This command will start the jest test runner in watch mode (any change detected in source files will trigger tests).

#### For advanced users

##### Running in CI

Test command will detect if `process.env.CI` is set, if it is so then it runs tests only once.

##### Tests environment (`node|jsdom`)

By default `test` command runs tests in `jsdom` environment. If you want to change it to node please use it with the `--node` argument like this `npm run test -- --node`.

### 3. Deploy to production

When you are done with development or you have reached a feature set that can be deployed. Just run the following command to get a minified build of your application.

```
npm run build
```

This will generate a `build` directory which contains everything you need to run your application.

**If you are using a custom template and not the `js-app-template-universal` please make sure that the build destination is the same. This destination can differ if the template is using some custom plugin.**

### 4. Profit

Congratulations. You are now ready to create your first javascript application.

## Advanced topics

* Creating your own plugin [TODO]

## Alternatives

If this project does not fulfill your needs, you might want to explore
alternatives. Some of the more popular ones are:

* [insin/nwb](https://github.com/insin/nwb)
* [mozilla-neutrino/neutrino-dev](https://github.com/mozilla-neutrino/neutrino-dev)
* [NYTimes/kyt](https://github.com/NYTimes/kyt)
* [zeit/next.js](https://github.com/zeit/next.js)
* [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby)
* [enclave](https://github.com/eanplatter/enclave)
* [motion](https://github.com/motion/motion)
* [quik](https://github.com/satya164/quik)
* [sagui](https://github.com/saguijs/sagui)
* [roc](https://github.com/rocjs/roc)
* [aik](https://github.com/d4rkr00t/aik)
* [react-app](https://github.com/kriasoft/react-app)
* [dev-toolkit](https://github.com/stoikerty/dev-toolkit)
* [tarec](https://github.com/geowarin/tarec)
