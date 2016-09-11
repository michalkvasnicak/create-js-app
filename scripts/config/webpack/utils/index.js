/* @flow */

function removeEmpty(x /*: Array<any> */) /*: Array<any> */ {
  return x.filter(y => !!y);
}

// :: bool -> (Any, Any) -> Any
function ifElse(condition /*: boolean*/) /*: (then: any, or: any) => any */ {
  return (then, or) => (condition ? then : or);
}

function merge(...funcArgs /*: Array<any> */) /*: Object */ {
  const args = removeEmpty(...funcArgs);

  return Object.assign({}, ...args);
}

module.exports = {
  removeEmpty,
  ifElse,
  merge,
};
