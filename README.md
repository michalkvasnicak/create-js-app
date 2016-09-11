# Create JS App

**This project is under development, API can change in different ways. Any help is appreciated :) Feel free to open PR.**

Create full stack javascript apps with no build configuration and one dependency.

## Installation

```sh
npm install -g create-js-app

create-js-app my-app
cd my-app/
npm start
```

Then open [http://localhost:3000](http://localhost:3000) to see your app.

## Development

To start development run following command in project root directory.

```sh
npm start
```

## Production

To create a minified build run following command in project root directory.

```sh
npm run build
```

## Configuration

```js
// .app.js file in project directory

module.exports = {
    // default is create-js-app-scripts/scripts/config/eslint/default.js
    eslint: 'create-js-app-scripts/scripts/config/eslint/airbnb.js',

    // tasks you want to run during development
    // it will terminate them when you terminate development script
    tasks: [
        (eventEmitter) => {
            // do something, maybe watch files using chokidar, anything
            eventEmitter.emit('task-log', 'some info');
            eventEmitter.emit('task-log-error', 'some info');
            eventEmitter.emit('task-log-info', 'some info');
            eventEmitter.emit('task-log-success', 'some info');
            eventEmitter.emit('task-log-warning', 'some info');

            return {
                /**
                 * This is used to terminate task when command receives SIGTERM
                 * @returns {Promise}
                 */
                terminate() {
                    return Promise.resolve();
                }
            }
        }
    ]
};
```

## Directory structure
**There is not an init command at the time so you need to create this manually**

```
src
    /client
        /index.js
    /server
        /index.js
```

```js
// example of server side javascript file
// you can use any node.js http framework
// but you have to export listener
// so create-js-app can manage it
//src/server/index.js

import Koa from 'koa';

const app = new Koa();

// SERVER_PORT is provided by webpack build
const listener = app.listen(SERVER_PORT);

export default listener;

```
