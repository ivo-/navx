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
    let transformedStructure = nextFn(select(path, structure));
    if (!Array.isArray(transformedStructure)) {
      transformedStructure = [transformedStructure];
    }
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

/**
 * @private
 */
const MULTI_PATH = {
  ...GenericNavigator,
  name: 'MULTI_PATH',

  selectForAll(paths, structure, nextFn) {
    paths
      .map(path => select(path, structure))
      .reduce((p, n) => [...p, ...n])
      .forEach(v => nextFn(v));
  },

  transformForAll(paths, structure, nextFn) {
    return paths.reduce((res, path) => (
      SUBSELECT.transformForAll(
        path,
        res,
        results => results.map(a => nextFn(a))
      )
    ), structure);
  },
};

/**
 * Navigates to all the items in all the pats. For transforms, applies updates
 * to the paths in order. It is like calling select/transform multiple times.
 *
 * @example
 *
 *   select([multi-path([prop('a')], [prop('b')])], {a: 0, b: 1, c: 2});
 *   // => [0, 1]
 *
 *   transform(
 *     [multi-path([prop('a')], [prop('b')])],
 *     v => v - 1,
 *     { a: 0, b: 1, c: 2 }
 *   );
 *   // => { a: -1, b: 0, c: 2 }
 *
 */
function multiPath(...paths) {
  return [MULTI_PATH, paths];
}

/**
 * @private
 */
const IF_PATH = {
  ...GenericNavigator,
  name: 'IF_PATH',

  selectForAll(condPath, thenPath, elsePath, structure, nextFn) {
    if (select(condPath, structure).length > 0) {
      select(thenPath, structure).map(v => nextFn(v));
    } else if (elsePath) {
      select(elsePath, structure).map(v => nextFn(v));
    }
  },

  transformForAll(condPath, thenPath, elsePath, structure, nextFn) {
    if (select(condPath, structure).length > 0) {
      return SUBSELECT.transformForAll(
        thenPath,
        structure,
        results => results.map(a => nextFn(a))
      );
    }

    if (elsePath) {
      return SUBSELECT.transformForAll(
        elsePath,
        structure,
        results => results.map(a => nextFn(a))
      );
    }

    return structure;
  },
};

/**
 * Tests if selecting with `condPath` on the current structure returns
 * anything. If so, it navigates to the corresponding `thenPath`, if not -
 * navigates to `elsePath`.
 *
 * @example
 *
 *  transform(
 *    [ifPath([prop('a')], [prop('b')], [prop('c')])],
 *    v => v + 1,
 *    { a: 0, b: 1, c: 2 }
 *  );
 *  // => { a: 0, b: 2, c: 2 }
 *
 *  transform(
 *    [ifPath([prop('a')], [prop('b')], [prop('c')])],
 *    v => v + 1,
 *    { b: 1, c: 2 }
 *  );
 *  // => { b: 1, c: 3 }
 *
 */
function ifPath(condPath, thenPath, elsePath) {
  return [IF_PATH, condPath, thenPath, elsePath];
}

module.exports = {
  SUBSELECT,
  subselect,
  transformed,
  reduced,
  multiPath,
  ifPath,
};
