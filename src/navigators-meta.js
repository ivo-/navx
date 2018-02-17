const { select, transform } = require('./api');
const {
  GenericNavigator,
  MAP,
} = require('./navigators');

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
    const transformedStructure = nextFn(select(path, structure));
    return transform(path, () => transformedStructure.shift(), structure);
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

/**
 * Navigates to `transform(path, fn, structure)`.
 *
 * @example
 *
 *   select([transformed([OBJECT_VALS], v => v + 1)], { a: 1, b: 2, c: 3 });
 *   // => [{ a: 2, b: 3, c: 4 }]
 *
 */
function transformed(path, fn) {
  return [MAP, transform(path, fn)];
}

/**
 * Navigates to a view of the current structure by transforming with a reduction
 * over the selected values.
 *
 * @example
 *
 *   select([reduced([EACH], (p, n) => p + n)], [1, 2, 3, 4]);
 *   // => [10]
 *
 */
function reduced(path, fn) {
  return [MAP, v => select(path, v).reduce(fn)];
}

module.exports = {
  SUBSELECT,
  subselect,
  transformed,
  reduced,
};
