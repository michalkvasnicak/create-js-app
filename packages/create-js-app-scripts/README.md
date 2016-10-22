# create-js-app-scripts

Configuration and scripts used by [Create JS App](https://github.com/michalkvasnicak/create-js-app)

## Commands

### `npm build` - starts production build

### `npm start` - starts development environment

### `npm test` - starts jest tests configured for jsdom environment

Starts jest tests configured for jsdom environment. In this case, test files has to be placed under `__tests__` directory or filenames has to be suffixed with `spec.(js|jsx)` or `test.(js|jsx)` suffix.

### `npm test -- --node`

Starts jest tests configured for node environment. In this case, test files has to be placed under `__tests_node__` directory or filenames has to be suffixed with `spec.node.(js|jsx)` or `test.node.(js|jsx)` suffix.
