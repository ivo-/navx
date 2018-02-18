/*
 * @private
 */
function isPlainObject(v) {
  return typeof v === 'object'
    && v !== null
    && !Array.isArray(v);
}

/**
 *   const NavigatorExtended = {
 *     ...Navigator,
 *     name: 'NavigatorExtended',
 *
 *     checks: [
 *       ...Navigator.checks,
 *       [(v) => v.constructor === Map, 'map']
 *     ],
 *   }
 *
 * @private
 */
const Navigator = {
  isNavigator: true,

  toString() { return this.name; },

  checks: [
    [Array.isArray, 'Array'],
    [isPlainObject, 'Object'],
  ],

  _op(structure, args, nextFn, op, collected) {
    const match = this.checks.find(([check]) => (
      check(structure)
    ));

    if (!match) {
      throw new Error(`Cannot find valid type check for provided structure: ${
        JSON.stringify(structure)
      } in navigator ${this.name}.`);
    }

    const type = match[1];

    let method = `${op}For${type}`;
    if (!this[method]) method = `bothFor${type}`;
    if (!this[method]) {
      throw new Error(`Cannot find implementation for operation: ${
        op
      }. Define "${op}For${type}" or "bothFor${type}" method in navigator ${
        this.name
      }.`);
    }

    return this[method](...args, structure, nextFn, collected);
  },

  select(args, structure, nextFn, collected) {
    return this._op(structure, args, nextFn, 'select', collected);
  },

  transform(args, structure, nextFn, collected) {
    return this._op(structure, args, nextFn, 'transform', collected);
  },
};

/**
 * @private
 */
const GenericNavigator = {
  ...Navigator,

  checks: [
    [(() => true), 'All'],
  ],
};

/**
 * Navigates to every item in Array or [key, value] pair for object.
 *
 *
 *   select([EACH], [1, 2, 3])
 *   // => [1, 2, 3]
 *
 *   transform([EACH], v => v + 1, [1, 2, 3])
 *   // => [2, 3, 4]
 *
 *   select([EACH], {a: 1, b: 2})
 *   // => [['a', 1], ['b', 2]]
 *
 *   transform([EACH], (v => v.slice().reverse()), {a: 1, b: 2})
 *   // => {1: 'a', 2: 'b'}
 *
 */
const EACH = {
  ...Navigator,
  name: 'EACH',

  bothForArray(arr, nextFn) {
    return arr.map(v => nextFn(v));
  },

  selectForObject(obj, nextFn) {
    Object.entries(obj).forEach(entry => nextFn(entry));
  },

  transformForObject(obj, nextFn) {
    return Object.entries(obj)
      .map(entry => nextFn(entry))
      .reduce((result, [k, v]) => (
        result[k] = v, result
      ), {});
  },
};

/**
 * Navigates to first item in Array.
 *
 *   select([FIRST], [1, 2, 3]);
 *   // => [1]
 *
 *   setval([FIRST], 0, [1, 2, 3]);
 *   // => [0, 2, 3]
 *
 */
const FIRST = {
  ...Navigator,
  name: 'FIRST',

  selectForArray(arr, nextFn) {
    nextFn(arr[0]);
  },

  transformForArray(arr, nextFn) {
    return arr.map((v, i) => (
      i > 0 ? v : nextFn(v)
    ));
  },
};

/**
 * Navigates to last item in Array.
 *
 *   select([LAST], [1, 2, 3]);
 *   // => [3]
 *
 *   setval([LAST], 0, [1, 2, 3]);
 *   // => [1, 2, 0]
 *
 */
const LAST = {
  ...Navigator,
  name: 'LAST',

  selectForArray(arr, nextFn) {
    nextFn(arr[arr.length - 1]);
  },

  transformForArray(arr, nextFn) {
    return arr.map((v, i) => (
      i === arr.length - 1 ? nextFn(v) : v
    ));
  },
};

/**
 * Navigates to the empty array after the end of a array. Useful to add
 * multiple values to array.
 *
 *   setval([END], [4, 5], [1, 2, 3]);
 *   // => [1, 2, 3, 4, 5]
 *
 */
const END = {
  ...Navigator,
  name: 'END',

  selectForArray(_, nextFn) {
    nextFn();
  },

  transformForArray(arr, nextFn) {
    return [
      ...arr,
      ...nextFn([]),
    ];
  },
};

/**
 * Navigates to the empty array before the beginning of a array. Useful to add
 * multiple values to array.
 *
 *   setval([BEGINNING], [-1, 0], [1, 2, 3]);
 *   // => [-1, 0, 1, 2, 3]
 *
 */
const BEGINNING = {
  ...Navigator,
  name: 'BEGINNING',

  selectForArray(_, nextFn) {
    nextFn();
  },

  transformForArray(arr, nextFn) {
    return [
      ...nextFn([]),
      ...arr,
    ];
  },
};

/**
 * Navigates to the void element after the end of a array. Useful to add
 * single value to array.
 *
 *   setval([AFTER_ELEM], 4, [1, 2, 3]);
 *   // => [1, 2, 3, 4]
 *
 */
const AFTER_ELEM = {
  ...Navigator,
  name: 'AFTER_ELEM',

  selectForArray(_, nextFn) {
    nextFn();
  },

  transformForArray(arr, nextFn) {
    return [
      ...arr,
      nextFn(),
    ];
  },
};

/**
 * Navigates to the void element before the beginning of a array. Useful to add
 * single value to array.
 *
 *   setval([BEFORE_ELEM], 0, [1, 2, 3]);
 *   // => [0, 1, 2, 3]
 *
 */
const BEFORE_ELEM = {
  ...Navigator,
  name: 'BEFORE_ELEM',

  selectForArray(_, nextFn) {
    nextFn();
  },

  transformForArray(arr, nextFn) {
    return [
      nextFn(),
      ...arr,
    ];
  },
};

/**
 * Navigates to each value of an Object.
 *
 *   select([OBJECT_VALS], { a: 1, b: 2 });
 *   // => [1, 2]
 *
 *   transform([OBJECT_VALS], v => v + 2, { a: 1, b: 2 });
 *   // => { a: 3, b: 4 }
 *
 *   select([OBJECT_VALS, OBJECT_VALS], { a: { b: 'c' }, d: { e: 'f' } });
 *   // => ['c', 'f']
 *
 */
const OBJECT_VALS = {
  ...Navigator,
  name: 'OBJECT_VALS',

  selectForObject(obj, nextFn) {
    Object.values(obj).forEach(v => nextFn(v));
  },

  transformForObject(obj, nextFn) {
    return Object.keys(obj).reduce((result, k) => (
      result[k] = nextFn(obj[k]), result
    ), {});
  },
};

/**
 * Navigates to each key of an Object.
 *
 *   select([OBJECT_KEYS], { a: 1, b: 2 });
 *   // => ['a', 'b']
 *
 *   transform([OBJECT_KEYS], v => v + v, { a: 1, b: 2 });
 *   // => { aa: 1, bb: 2 }
 *
 *   select([OBJECT_VALS, OBJECT_KEYS], { a: { b: 'c' }, d: { e: 'f' } });
 *   // => ['b', 'e']
 *
 */
const OBJECT_KEYS = {
  ...Navigator,
  name: 'OBJECT_KEYS',

  selectForObject(obj, nextFn) {
    Object.keys(obj).forEach(k => nextFn(k));
  },

  transformForObject(obj, nextFn) {
    return Object.keys(obj).reduce((result, k) => (
      result[nextFn(k)] = obj[k], result
    ), {});
  },
};

/**
 * @private
 */
const FILTERER = {
  ...Navigator,
  name: 'FILTERER',

  selectForArray(pred, arr, nextFn) {
    nextFn(arr.filter(pred));
  },

  transformForArray(pred, arr, nextFn) {
    const filtered = nextFn(arr.filter(pred));
    const filteredCopy = [...filtered];
    return arr.reduce((result, v) => {
      if (pred(v)) {
        const fv = filteredCopy.shift();
        if (fv) result.push(fv);
      } else {
        result.push(v);
      }

      return result;
    }, []);
  },
};

/**
 * Navigates to Array formed from filtering other Array.
 *
 *   select([filterer(v => v % 2 === 0)], [1, 2, 3, 4, 5]);
 *   // => [[2, 4]]
 *
 *   transform([filterer(v => v % 2 === 0)], () => [20, 40], [1, 2, 3, 4, 5]);
 *   // => [1, 20, 3, 40, 5]
 *
 * @param {Function} pred
 */
function filterer(pred) {
  return [FILTERER, pred];
}

/**
 * @private
 */
const PROP = {
  ...Navigator,
  name: 'PROP',

  selectForObject(key, obj, nextFn) {
    if (key in obj) nextFn(obj[key]);
  },

  transformForObject(key, obj, nextFn) {
    return { ...obj, [key]: nextFn(obj[key]) };
  },

  selectForArray(...args) {
    this.selectForObject(...args);
  },

  transformForArray(index, arr, nextFn) {
    const newRes = arr.slice();
    newRes[index] = nextFn(arr[index]);
    return newRes;
  },
};

/**
 * Navigates to a property value in Object or index value in Array.
 *
 *   select([prop('a')], { a: 1, b: 2 });
 *   // => [1]
 *
 *   setval([prop('a')], 0, { a: 1, b: 2 });
 *   // => { a: 0, b: 2 }
 *
 * @param {String | Number} key
 */
function prop(key) {
  return [PROP, key];
}

/**
 * Navigates to each [elem, index] pair in Array.
 *
 *   select([INDEXED_VALS], [1, 2, 3]);
 *   // => [[1, 0], [2, 1], [3, 2]]
 *
 *   transforms([INDEXED_VALS], ([v, i]) => ([i * 2, v - 1]), [1, 2, 3])
 *   // => [0, 2, 4]
 *
 */
const INDEXED_VALS = {
  ...Navigator,
  name: 'INDEXED_VALS',

  selectForArray(arr, nextFn) {
    arr.map((elem, index) => nextFn([elem, index]));
  },

  transformForArray(arr, nextFn) {
    return arr.map((elem, index) => (
      nextFn([elem, index])
    )).reduce((result, [elem, index]) => (
      result[index] = elem, result
    ), new Array(arr.length));
  },
};

/**
 * @private
 */
const SKIP = {
  ...GenericNavigator,
  name: 'SKIP',

  selectForAll(pred, structure, nextFn) {
    if (!pred(structure)) {
      nextFn(structure);
    }
  },


  transformForAll(pred, structure, nextFn) {
    if (!pred(structure)) {
      return nextFn(structure);
    }
    return structure;
  },
};

/**
 * Navigates to structure only if `pred(structure)` is false.
 *
 *   select([EACH, skip(v => v % 2 !== 0)], [2, 3, 4]);
 *   // => [2, 4]
 *
 * @param {Function} pred
 */
function skip(pred) {
  return [SKIP, pred];
}

/**
 * Navigates to structure only if `pred(structure)` is true.
 *
 *   select([EACH, keep(v => v % 2 !== 0)], [2, 3, 4]);
 *   // => [3]
 *
 * @param {Function} pred
 */
function keep(pred) {
  return skip((...args) => !pred(...args));
}

/**
 * @private
 */
const MAP = {
  ...GenericNavigator,
  name: 'MAP',

  bothForAll(fn, structure, nextFn) {
    return nextFn(fn(structure));
  },
};

/**
 * Navigates to `fn(structure)`.
 *
 *   select([map(() => true)], false);
 *   // => [true]
 *
 *   select([map(Object.values)], { a: 1, b: 2 });
 *   // => [[1, 2]]
 *
 *   transform([EACH, map(v => v + 1)], v => v + 1, [1, 2, 3, 4]);
 *   // => [3, 4, 5, 6]
 *
 * @param {Function} fn
 */
function map(fn) {
  return [MAP, fn];
}

/**
 * @private
 */
const RANGE = {
  ...Navigator,
  name: 'RANGE',

  selectForArray(start, end, arr, nextFn) {
    nextFn(arr.slice(start, end));
  },

  transformForArray(start, end, arr, nextFn) {
    return [
      ...arr.slice(0, start),
      ...nextFn(arr.slice(start, end)),
      ...arr.slice(end),
    ];
  },
};

/**
 * Navigates to the sub-array bound by the indexes start (inclusive) and end
 * (exclusive).
 *
 *   select([range(0, 2)], [1, 2, 3, 4]);
 *   // => [[1, 2]]
 *
 *   transform([range(0, 2)], () => [0, 0], [1, 2, 3, 4]);
 *   // => [0, 0, 3, 4]
 *
 * @param {Number} start
 * @param {Number} end
 */
function range(start, end) {
  return [RANGE, start, end];
}

/**
 * @private
 */
const RANGE_DYNAMIC = {
  ...Navigator,
  name: 'RANGE_DYNAMIC',

  selectForArray(startFn, endFn, arr, nextFn) {
    nextFn(arr.slice(startFn(arr), endFn(arr)));
  },

  transformForArray(startFn, endFn, arr, nextFn) {
    const start = startFn(arr);
    const end = endFn(arr);
    return [
      ...arr.slice(0, start),
      ...nextFn(arr.slice(start, end)),
      ...arr.slice(end),
    ];
  },
};

/**
 * Navigates to the sub-array bound by the indexes created by startFn(structure)
 * (inclusive) and endFn(structure).
 *
 *   select([rangeDynamic(() => 0, () => 2)], [1, 2, 3, 4]);
 *   // => [[1, 2]]
 *
 *   transform([rangeDynamic(() => 0, () => 2)], () => [0, 0], [1, 2, 3, 4]);
 *   // => [0, 0, 3, 4]
 *
 * @param {Function} startFn
 * @param {Function} endFn
 */
function rangeDynamic(startFn, endFn) {
  return [RANGE_DYNAMIC, startFn, endFn];
}

/**
 * @private
 */
const PROP_NAME = {
  ...Navigator,
  name: 'PROP_NAME',

  selectForObject(key, obj, nextFn) {
    if (key in obj) nextFn(key);
  },

  transformForObject(key, obj, nextFn) {
    const result = { ...obj, [nextFn(key)]: obj[key] };
    delete result[key];
    return result;
  },
};

/**
 * Navigates to a key in object (index in array), not the value.
 *
 *   select([propName('a')], { a: 1, b: 2 });
 *   // => ['a']
 *
 *   setval([prop('a')], 'c', { a: 1, b: 2 });
 *   // => { c: 1, b: 2 }
 *
 * @param {String | Number} pred
 */
function propName(key) {
  return [PROP_NAME, key];
}

/**
 * @private
 */
const SUBMAP = {
  ...Navigator,
  name: 'SUBMAP',

  selectForObject(keys, obj, nextFn) {
    // Return to reuse the function in transform.
    return nextFn(keys.reduce((result, key) => (
      result[key] = obj[key], result
    ), {}));
  },

  transformForObject(keys, obj, nextFn) {
    const rest = Object.keys(obj).reduce((result, key) => (
      keys.includes(key) ? result : (
        result[key] = obj[key], result
      )
    ), {});

    return {
      ...rest,
      ...this.selectForObject(keys, obj, nextFn),
    };
  },
};

/**
 * Navigates to a submap of the original map.
 *
 *   select([submap(['a', 'b'])], { a: 1, b: 2, c: 3 });
 *   // => [{ a: 1, b: 2 }]
 *
 *   transform([submap(['a', 'b'])], () => ({ d: 4 }), { a: 1, b: 2, c: 3 });
 *   // => { c: 3, d: 4 }
 *
 * @param {Array} keys
 */
function submap(keys) {
  return [SUBMAP, keys];
}

/**
 * @private
 */
const KEYPATH = {
  ...Navigator,
  name: 'KEYPATH',

  selectForObject(keys, obj, nextFn) {
    nextFn(keys.reduce((result, key) => (
      result && result[key]
    ), obj));
  },

  transformForObject(keys, obj, nextFn) {
    if (keys.length === 0) return nextFn(obj);

    const result = { ...obj };
    let current = result;
    keys.forEach((key, i) => {
      if (i === keys.length - 1) {
        current[key] = nextFn(current[key]);
        return;
      }

      if (!(key in current)) {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }

      current = current[key];
    });

    return result;
  },
};

/**
 * Navigates to the value in specified keys path or `undefined` if the path
 * doesn't exist in the structure.
 *
 *   select([keypath('a', 'b')], { a: { b: 1 } });
 *   // => [1]
 *
 *   select([keypath('a', 'b')], {});
 *   // => [undefined]
 *
 *   transform([keypathStrict('a', 'b')], v => v + 1, {});
 *   // => { a: { b: 2 } }
 *
 */
function keypath(...keys) {
  return [KEYPATH, keys];
}

/**
 * @private
 */
const KEYPATH_STRICT = {
  ...Navigator,
  name: 'KEYPATH',

  selectForObject(keys, obj, nextFn) {
    nextFn(keys.reduce((result, key) => (
      result && result[key]
    ), obj));
  },

  transformForObject(keys, obj, nextFn) {
    const val = keys.reduce((result, key) => (
      result && result[key]
    ), obj);
    if (val == null) return obj;

    return KEYPATH.transformForObject(keys, obj, nextFn);
  },
};

/**
 * Same as `keypath`, but stops navigation if the path doesn't exist
 * in structure.
 *
 *   transform([keypathStrict('a', 'b')], v => v + 1, {});
 *   // => {}
 *
 */
function keypathStrict(...keys) {
  return [KEYPATH_STRICT, keys];
}

/**
 * @private
 */
const WHEN = {
  ...GenericNavigator,
  name: 'WHEN',

  bothForAll(pred, val, structure, nextFn) {
    return nextFn(pred(structure) ? val : structure);
  },
};

/**
 * Navigates to the structure if `pred(structure)` is false, else navigate to
 * the provided argument.
 *
 *   select([EACH, when((v => v.length == 0), [1])], [[2], [], [3], []]);
 *   // => [[2], [1], [3], [1]]
 *
 * @param {Function} pred
 * @param {Any} val
 */
function when(pred, val) {
  return [WHEN, pred, val];
}

/**
 * Navigates to the value if it is not `null` or `undefined`, else navigate to
 * the provided argument.
 *
 *   select([EACH, or([1])], [[2], null, [3], null]);
 *   // => [[2], [1], [3], [1]]
 *
 * @param {Any} val
 */
function or(val) {
  return [WHEN, (v => v == null), val];
}

/**
 * Navigates to empty sub-array before selected index and previous index. It
 * is useful to insert one or multiple elements before selected index.
 *
 *   setval([beforeIndex(2)], [3], [1, 2, 4, 5]);
 *   // => [1, 2, 3, 4, 5]
 *
 * @param {Number} i
 */
function beforeIndex(i) {
  return [RANGE, i, i];
}

/**
 * For select, stops navigation and returns empty result. For transform,
 * returns structure unchanged.
 */
const STOP = {
  ...GenericNavigator,
  name: 'STOP',

  bothForAll(structure) {
    return structure;
  },
};

/**
 * Navigates to the structure unchanged.
 *
 *   transform([SELF], v => v + 1, 1);
 *   // => 2
 *
 */
const SELF = {
  ...GenericNavigator,
  name: 'SELF',

  bothForAll(structure, nextFn) {
    return nextFn(structure);
  },
};

module.exports = {
  Navigator,
  GenericNavigator,

  EACH,
  FIRST,
  LAST,
  END,
  BEGINNING,
  AFTER_ELEM,
  BEFORE_ELEM,
  OBJECT_VALS,
  OBJECT_KEYS,
  FILTERER,
  PROP,
  INDEXED_VALS,
  SKIP,
  MAP,
  RANGE,
  RANGE_DYNAMIC,
  PROP_NAME,
  SUBMAP,
  KEYPATH,
  KEYPATH_STRICT,
  WHEN,
  STOP,
  SELF,

  keypath,
  keypathStrict,
  when,
  or,
  filterer,
  submap,
  propName,
  rangeDynamic,
  range,
  map,
  keep,
  skip,
  prop,
  beforeIndex,
};
