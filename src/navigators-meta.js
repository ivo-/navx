const { GenericNavigator } = require('./navigators');
const { select, transform } = require('./api');

/**
 * @private
 */
const SUBSELECT = {
  ...GenericNavigator,
  name: 'SUBSELECT',

  selectForAll(path, structure, nextFn) {
    nextFn(select(path, structure));
  },

  transformForAll(path, structure, nextFn) {
    const transformed = nextFn(select(path, structure));
    return transform(path, () => transformed.shift(), structure);
  },
};

/**
 * Like `filterer` but instead of predicate accepts `path`. Navigates to array
 * of selected values, but this array is `view` of the original structure and
 * can be transformed.
 *
 * @example
 *
 *   transform(
 *     [subselect(OBJECT_VALS, EACH, OBJECT_VALS)],
 *     v => v.slice().reverse(),
 *     {:items [{ a: 1}, { b: 2 }, { c: 3 }]}
 *   )
 *   // => {:items [{ a: 3}, { b: 2 }, { c: 1 }]}
 *
 */
function subselect(...path) {
  return [SUBSELECT, path];
}

module.exports = {
  SUBSELECT,
  subselect,
};
