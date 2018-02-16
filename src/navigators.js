function isPlainObject(v) {
  return typeof v === 'object'
    && v !== null
    && !Array.isArray(v);
}

/**
 * @example:
 *
 *   const NavigatorExtended = {
 *     ...Navigator,
 *     name: 'NavigatorExtended',
 *
 *     checks: [
 *       ...Navigator.checks,
 *       [(v) => v.constructor === Map, 'map']
 *     ],
 *   }
 * @private
 */
const Navigator = {
  isNavigator: true,

  checks: [
    [Array.isArray, 'Array'],
    [isPlainObject, 'Object'],
  ],

  _op(structure, args, nextFn, op) {
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

    return this[method](...args, structure, nextFn);
  },

  select(args, structure, nextFn) {
    return this._op(structure, args, nextFn, 'select');
  },

  transform(args, structure, nextFn) {
    return this._op(structure, args, nextFn, 'transform');
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
 * @example
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
 * @example
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
 * @example
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
 * Navigates to the empty array after the end of a array.
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
 * Navigates to the empty array before the beginning of a array.
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
 * Navigates to the void element after the end of a array.
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
 * Navigates to the void element before the beginning of a array.
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
 * Navigates to Array formed from filtering other Array.
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

function filterer(pred) {
  return [FILTERER, pred];
}

/**
 * Navigates to a property value in Object or index value in Array.
 */
const PROP = {
  ...Navigator,
  name: 'PROP',

  selectForObject(key, obj, nextFn) {
    nextFn(obj[key]);
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

function prop(key) {
  return [PROP, key];
}

/**
 * Navigates to each [elem, index] pair in Array.
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
 * Navigates to structure only if `pred(structure)` is false.
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

function skip(pred) {
  return [SKIP, pred];
}

/**
 * Navigates to structure only if `pred(structure)` is true.
 */
function keep(pred) {
  return skip((...args) => !pred(...args));
}

/**
 * Navigates to `fn(structure)`.
 */
const MAP = {
  ...GenericNavigator,
  name: 'MAP',

  bothForAll(fn, structure, nextFn) {
    return nextFn(fn(structure));
  },
};

function map(fn) {
  return [MAP, fn];
}

/**
 * Navigates to the sub-array bound by the indexes start (inclusive) and end
 * (exclusive).
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

function range(start, end) {
  return [RANGE, start, end];
}

/**
 * Navigates to the sub-array bound by the indexes created by startFn(structure)
 * (inclusive) and endFn(structure) * (exclusive).
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

function rangeDynamic(startFn, endFn) {
  return [RANGE_DYNAMIC, startFn, endFn];
}

/**
 * Navigates to a key in object (index in array), not the value.
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

function propName(key) {
  return [PROP_NAME, key];
}

/**
 * Navigates to a submap.
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

function submap(keys) {
  return [SUBMAP, keys];
}

/**
 * Navigates to the value in specified keys path or `undefined` if the path
 * doesn't exist in the structure.
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

function keypath(...keys) {
  return [KEYPATH, keys];
}

/**
 * Navigates to the value in specified keys path or stops navigation if
 * the path doesn't * exist in structure.
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

function keypathStrict(...keys) {
  return [KEYPATH_STRICT, keys];
}

/**
 * Navigates to the structure if `pred(structure)` is false, else navigate to
 * the provided argument.
 */
const WHEN = {
  ...GenericNavigator,
  name: 'WHEN',

  bothForAll(pred, val, structure, nextFn) {
    return nextFn(pred(structure) ? val : structure);
  },
};

function when(pred, val) {
  return [WHEN, pred, val];
}

/**
 * Navigates to the value if it is not `null` or `undefined`, else navigate to
 * the provided argument.
 */
function or(val) {
  return [WHEN, (v => v == null), val];
}

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
};
