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
 */
export const Navigator = {
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
 * Navigates to every item in Array or [key, value] pair for object.
 */
export const EACH = {
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
 */
export const FIRST = {
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
 */
export const LAST = {
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
export const END = {
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
export const BEGINNING = {
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
export const AFTER_ELEM = {
  ...Navigator,
  name: 'AFTER',

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
export const BEFORE_ELEM = {
  ...Navigator,
  name: 'BEFORE',

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
export const OBJECT_VALS = {
  ...Navigator,
  name: 'OBJECT',

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
export const OBJECT_KEYS = {
  ...Navigator,
  name: 'OBJECT',

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
export const FILTERER = {
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

export function filterer(pred) {
  return [FILTERER, pred];
}

/**
 * Navigates to a property value in Object or index value in Array.
 */
export const PROP = {
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

export function prop(key) {
  return [PROP, key];
}

/**
 * Navigates to each [elem, index] pair in Array.
 */
export const INDEXED_VALS = {
  ...Navigator,
  name: 'INDEXED',

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
export const SKIP = {
  ...Navigator,
  name: 'SKIP',

  checks: [
    [(() => true), 'All'],
  ],

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

export function skip(pred) {
  return [SKIP, pred];
}

/**
 * Navigates to structure only if `pred(structure)` is true.
 */
export function keep(pred) {
  return skip((...args) => !pred(...args));
}

/**
 * Navigates to `fn(structure)`.
 */
export const MAP = {
  ...Navigator,
  name: 'SKIP',

  checks: [
    [(() => true), 'All'],
  ],

  bothForAll(fn, structure, nextFn) {
    return nextFn(fn(structure));
  },
};

export function map(fn) {
  return [MAP, fn];
}

/**
 * Navigates to the sub-array bound by the indexes start (inclusive) and end
 * (exclusive).
 */
export const RANGE = {
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

export function range(start, end) {
  return [RANGE, start, end];
}

/**
 * Navigates to the sub-array bound by the indexes created by startFn(structure)
 * (inclusive) and endFn(structure) * (exclusive).
 */
export const RANGE_DYNAMIC = {
  ...Navigator,
  name: 'RANGE',

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

export function rangeDynamic(startFn, endFn) {
  return [RANGE_DYNAMIC, startFn, endFn];
}

/**
 * Navigates to a key in object (index in array), not the value.
 */
export const PROP_NAME = {
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

export function propName(key) {
  return [PROP_NAME, key];
}

/**
 * Navigates to a submap.
 */
export const SUBMAP = {
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

export function submap(keys) {
  return [SUBMAP, keys];
}

/**
 * Navigates to the value in specified keys path or `undefined` if the path
 * doesn't exist in the structure.
 */
export const KEYPATH = {
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

export function keypath(...keys) {
  return [KEYPATH, keys];
}

/**
 * Navigates to the value in specified keys path or stops navigation if
 * the path doesn't * exist in structure.
 */
export const KEYPATH_STRICT = {
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

export function keypathStrict(...keys) {
  return [KEYPATH_STRICT, keys];
}

/**
 * Navigates to the structure if `pred(structure)` is false, else navigate to
 * the provided argument.
 */
export const WHEN = {
  ...Navigator,
  name: 'WHEN',

  checks: [
    [(() => true), 'All'],
  ],

  bothForAll(pred, val, structure, nextFn) {
    return nextFn(pred(structure) ? val : structure);
  },
};

export function when(pred, val) {
  return [WHEN, pred, val];
}

/**
 * Navigates to the value if it is not `null` or `undefined`, else navigate to
 * the provided argument.
 */
export function or(val) {
  return [WHEN, (v => v == null), val];
}
