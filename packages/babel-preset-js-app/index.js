const client = require('./client');
const env = process.env.BABEL_ENV || process.env.NODE_ENV;
const server = require('./server');
const shared = require('./shared');

if (env !== 'development' && env !== 'test' && env !== 'production') {
  throw new Error(
    `babel-preset-js-app invalid \`NODE_ENV\` or \`BABEL_ENV\`.
Valid are development|production|test, instead received ${JSON.stringify(env)}`
  );
}

module.exports = Object.assign({}, shared);
module.exports.client = client;
module.exports.server = server;

