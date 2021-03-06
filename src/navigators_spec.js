/* eslint-disable quotes, no-eval, no-unused-vars */
const {
  select, transform, setval, multi,
} = require('./api');

const {
  EACH,
  END,
  BEGINNING,
  LAST,
  FIRST,
  AFTER_ELEM,
  BEFORE_ELEM,
  OBJECT_VALS,
  OBJECT_KEYS,
  INDEXED_VALS,
  STOP,
  SELF,

  or,
  map,
  when,
  skip,
  keep,
  prop,
  propName,
  range,
  submap,
  keypath,
  keypathStrict,
  filterer,
  rangeDynamic,
  beforeIndex,
} = require('./navigators');

const {
  subselect,
  transformed,
  reduced,
  multiPath,
  ifPath,
  condPath,
  collect,
  collectOne,
  COLLECT_CURRENT,
  putval,
} = require('./navigators-meta');


exports.EACH = test => {
  test.selectsDeepEq(`[EACH]`, [1, 2], [1, 2]);

  test.transformsDeepEq(`[EACH]`, v => v + 1, [1, 2], [2, 3]);

  test.selectsDeepEq(`[EACH]`, { a: 1, b: 2 }, [['a', 1], ['b', 2]]);

  test.transformsDeepEq(
    `[EACH]`,
    ([k]) => (k === 'a' ? ['c', 3] : ['d', 4]),
    { a: 1, b: 2 },
    { c: 3, d: 4 }
  );

  test.transformsDeepEq(
    `[EACH]`,
    v => v.slice().reverse(),
    { a: 1, b: 2 },
    { 1: 'a', 2: 'b' }
  );

  test.done();
};

exports.FIRST = test => {
  test.selectsDeepEq(`[FIRST]`, [1, 2, 3], [1]);

  test.selectsDeepEq(`[EACH, FIRST]`, { a: 1, b: 2 }, ['a', 'b']);

  test.transformsDeepEq(
    `[EACH, FIRST]`,
    v => v + 1,
    { a: 1, b: 2 },
    { a1: 1, b1: 2 }
  );

  test.done();
};

exports.LAST = test => {
  test.selectsDeepEq(`[LAST]`, [1, 2, 3], [3]);

  test.selectsDeepEq(`[EACH, LAST]`, { a: 1, b: 2 }, [1, 2]);

  test.transformsDeepEq(
    `[EACH, LAST]`,
    v => v + 1,
    { a: 1, b: 2 },
    { a: 2, b: 3 }
  );

  test.done();
};

exports.END = test => {
  test.selectsDeepEq(`[END]`, [1, 2], [undefined]);

  test.transformsDeepEq(
    `[END]`,
    () => [3, 4],
    [1, 2],
    [1, 2, 3, 4],
  );

  test.transformsDeepEq(
    `[EACH, END]`,
    () => [100],
    [[1], [2], [3]],
    [[1, 100], [2, 100], [3, 100]],
  );

  test.done();
};

exports.BEGINNING = test => {
  test.selectsDeepEq(`[BEGINNING]`, [1, 2], [undefined]);

  test.transformsDeepEq(
    `[BEGINNING]`,
    () => [1, 2],
    [3, 4],
    [1, 2, 3, 4],
  );

  test.transformsDeepEq(
    `[EACH, BEGINNING]`,
    () => [100],
    [[1], [2], [3]],
    [[100, 1], [100, 2], [100, 3]],
  );

  test.done();
};


exports.BEFORE_ELEM = test => {
  test.selectsDeepEq(`[BEFORE_ELEM]`, [1, 2], [undefined]);

  test.transformsDeepEq(
    `[BEFORE_ELEM]`,
    () => 1,
    [3, 4],
    [1, 3, 4],
  );

  test.transformsDeepEq(
    `[EACH, BEFORE_ELEM]`,
    () => 100,
    [[1], [2], [3]],
    [[100, 1], [100, 2], [100, 3]],
  );

  test.done();
};

exports.AFTER_ELEM = test => {
  test.selectsDeepEq(`[AFTER_ELEM]`, [1, 2], [undefined]);

  test.transformsDeepEq(
    `[AFTER_ELEM]`,
    () => 1,
    [3, 4],
    [3, 4, 1],
  );

  test.transformsDeepEq(
    `[EACH, AFTER_ELEM]`,
    () => 100,
    [[1], [2], [3]],
    [[1, 100], [2, 100], [3, 100]],
  );

  test.done();
};

exports.OBJECT_VALS = test => {
  test.selectsDeepEq(`[OBJECT_VALS]`, { a: 1, b: 2 }, [1, 2]);

  test.transformsDeepEq(
    `[OBJECT_VALS]`,
    v => v + 2,
    { a: 1, b: 2 },
    { a: 3, b: 4 }
  );

  test.transformsDeepEq(
    `[OBJECT_VALS, (v => v === 2)]`,
    v => v + 1,
    { a: 1, b: 2, c: 2 },
    { a: 1, b: 3, c: 3 }
  );

  test.selectsDeepEq(
    `[OBJECT_VALS, OBJECT_VALS]`,
    {
      a: { b: 'c' },
      d: { e: 'f' },
    },
    ['c', 'f']
  );

  test.done();
};

exports.OBJECT_KEYS = test => {
  test.selectsDeepEq(`[OBJECT_KEYS]`, { a: 1, b: 2 }, ['a', 'b']);

  test.transformsDeepEq(
    `[OBJECT_KEYS]`,
    v => v + v,
    { a: 1, b: 2 },
    { aa: 1, bb: 2 }
  );

  test.selectsDeepEq(
    `[OBJECT_VALS, OBJECT_KEYS]`,
    { a: { b: 'c' }, d: { e: 'f' } },
    ['b', 'e']
  );

  test.transformsDeepEq(
    `[OBJECT_KEYS, (v => ['a', 'b'].includes(v))]`,
    k => k + k,
    { a: 1, b: 2, c: 10 },
    { aa: 1, bb: 2, c: 10 }
  );

  test.done();
};


exports.FILTERER = test => {
  test.selectsDeepEq(
    `[filterer(v => v % 2 === 0)]`,
    [1, 2, 3, 4, 5],
    [[2, 4]]
  );

  test.transformsDeepEq(
    `[filterer(v => v % 2 === 0)]`,
    () => [20, 40],
    [1, 2, 3, 4, 5],
    [1, 20, 3, 40, 5]
  );

  test.done();
};

exports.PROP = test => {
  test.selectsDeepEq([prop('a')], { a: 1, b: 2 }, [1]);

  test.selectsDeepEq(
    `[EACH, prop('a')]`,
    [{ a: 1 }, { a: 2 }, { a: 3 }],
    [1, 2, 3]
  );

  test.transformsDeepEq(
    `[prop('a')]`,
    () => 0,
    { a: 1, b: 2 },
    { a: 0, b: 2 }
  );

  test.transformsDeepEq(
    `[EACH, prop('a')]`,
    v => v * 2,
    [{ a: 1 }, { a: 2 }, { a: 3 }],
    [{ a: 2 }, { a: 4 }, { a: 6 }]
  );

  test.transformsDeepEq(
    `[EACH, prop('a')]`,
    v => v || 0,
    [{ a: 1 }, { a: 2 }, { b: 3 }],
    [{ a: 1 }, { a: 2 }, { b: 3, a: 0 }]
  );

  test.transformsDeepEq(
    `[EACH, prop(1)]`,
    () => 2,
    [[1], [1], [1]],
    [[1, 2], [1, 2], [1, 2]]
  );

  test.transformsDeepEq(
    `[prop('k'), OBJECT_VALS, (v => v === 2)]`,
    v => v + 1,
    { k: { a: 1, b: 2, c: 2 } },
    { k: { a: 1, b: 3, c: 3 } }
  );

  test.done();
};

exports.INDEXED_VALS = test => {
  test.selectsDeepEq(
    `[INDEXED_VALS]`,
    [1, 2, 3],
    [[1, 0], [2, 1], [3, 2]]
  );

  test.transformsDeepEq(
    `[INDEXED_VALS]`,
    ([v, i]) => ([i * 2, v - 1]),
    [1, 2, 3],
    [0, 2, 4],
  );

  test.selectsDeepEq(
    `[INDEXED_VALS]`,
    [{ a: 1 }, { a: 2 }, { a: 3 }],
    [[{ a: 1 }, 0], [{ a: 2 }, 1], [{ a: 3 }, 2]]
  );

  test.transformsDeepEq(
    `[INDEXED_VALS]`,
    ([v, i]) => [v, i + 1],
    [{ a: 1 }, { a: 2 }, { a: 3 }],
    [{ a: 1 }, { a: 2 }, { a: 3 }].reduce(
      (result, v, i) => ((result[i + 1] = v), result),
      new Array(4)
    )
  );

  test.done();
};

exports.SKIP = test => {
  test.selectsDeepEq(`[EACH, skip(v => v % 2 !== 0)]`, [2, 3, 4], [2, 4]);

  test.transformsDeepEq(
    `[EACH, skip(v => v % 2 === 0)]`,
    v => v + 1,
    [2, 3, 4],
    [2, 4, 4]
  );

  test.transformsDeepEq(
    `[EACH, prop('a'), skip(v => v.length < 2), EACH, skip(v => v % 2 === 0)]`,
    v => v + 1,
    [{ a: [2, 3, 4] }],
    [{ a: [2, 4, 4] }]
  );

  test.done();
};

exports.KEEP = test => {
  test.selectsDeepEq(`[EACH, keep(v => v % 2 !== 0)]`, [2, 3, 4], [3]);
  test.selectsDeepEq(`[EACH, (v => v % 2 !== 0)]`, [2, 3, 4], [3]);

  test.done();
};

exports.MAP = test => {
  test.selectsDeepEq(`[map(() => true)]`, null, [true]);
  test.selectsDeepEq(`[map(Object.values)]`, { a: 1, b: 2 }, [[1, 2]]);

  test.selectsDeepEq(
    `[map(Object.values), filterer(v => v === 2), LAST]`,
    { a: 1, b: 2 },
    [2]
  );

  test.transformsDeepEq(
    `[EACH, map(v => v + 1)]`,
    v => v + 1,
    [1, 2, 3, 4],
    [3, 4, 5, 6],
  );

  test.done();
};

exports.RANGE = test => {
  test.selectsDeepEq(`[range(0, 1)]`, [1, 2, 3, 4, 5, 6], [[1]]);
  test.selectsDeepEq(`[range(0, 1), EACH]`, [1, 2, 3, 4, 5, 6], [1]);

  test.transformsDeepEq(
    `[range(0, 2)]`,
    () => [0, 0],
    [1, 2, 3, 4],
    [0, 0, 3, 4]
  );

  test.transformsDeepEq(
    `[range(0, 1)]`,
    () => [9, 9, 9],
    [1, 2, 3, 4, 5, 6],
    [9, 9, 9, 2, 3, 4, 5, 6]
  );

  test.done();
};

exports.RANGE_DYNAMIC = test => {
  test.selectsDeepEq(
    `[rangeDynamic(() => 0, () => 2)]`,
    [1, 2, 3, 4, 5, 6],
    [[1, 2]]
  );
  test.transformsDeepEq(
    `[rangeDynamic(() => 0, () => 2)]`,
    () => [0, 0],
    [1, 2, 3, 4],
    [0, 0, 3, 4]
  );

  test.transformsDeepEq(
    `[rangeDynamic((() => 0), (() => 1))]`,
    () => [9, 9, 9],
    [1, 2, 3, 4, 5, 6],
    [9, 9, 9, 2, 3, 4, 5, 6]
  );

  test.transformsDeepEq(
    `[rangeDynamic((() => 0), (() => 1))]`,
    () => [9, 9, 9],
    [1, 2, 3, 4, 5, 6],
    [9, 9, 9, 2, 3, 4, 5, 6]
  );

  test.done();
};

exports.PROP_NAME = test => {
  test.selectsDeepEq(`[propName('a')]`, { a: 1 }, ['a']);

  test.selectsDeepEq(`[propName('b')]`, { a: 1 }, []);

  test.selectsDeepEq(`[EACH, propName('a')]`, [{ a: 1 }, { b: 1 }], ['a']);

  test.transformsDeepEq(`[propName('a')]`, () => 'b', { a: 1 }, { b: 1 });

  test.transformsDeepEq(
    `[EACH, propName('a')]`,
    () => 'b',
    [{ a: 1 }, { a: 1 }],
    [{ b: 1 }, { b: 1 }]
  );

  test.done();
};

exports.SUBMAP = test => {
  test.selectsDeepEq(
    `[submap(['a', 'b'])]`,
    { a: 1, b: 2, c: 3 },
    [{ a: 1, b: 2 }]
  );

  test.selectsDeepEq(
    `[EACH, submap(['a', 'b'])]`,
    [{ a: 1, b: 2, c: 3 }],
    [{ a: 1, b: 2 }]
  );

  test.transformsDeepEq(
    `[EACH, submap(['a', 'b'])]`,
    () => ({ d: 4 }),
    [{ a: 1, b: 2, c: 3 }],
    [{ c: 3, d: 4 }]
  );

  test.transformsDeepEq(
    `[EACH, submap(['a', 'b'])]`,
    () => ({}),
    [{ a: 1, b: 2, c: 3 }],
    [{ c: 3 }]
  );
  test.done();
};

exports.KEYPATH = test => {
  test.selectsDeepEq(`[keypath('a', 'b')]`, { a: { b: 1 } }, [1]);

  test.selectsDeepEq(`[keypath('a', 'b')]`, {}, [undefined]);

  test.transformsDeepEq(
    `[keypath('a', 'b')]`,
    v => v + 1,
    { a: { b: 1 } },
    { a: { b: 2 } }
  );

  test.transformsDeepEq(
    `[keypath('a', 'c')]`,
    () => 2,
    { a: { b: 1 } },
    { a: { b: 1, c: 2 } }
  );

  const r = {};
  test.transformsDeepEq(`[keypath('a', 'b')]`, () => 2, r, { a: { b: 2 } });
  test.deepEqual(r, {});

  test.transformsDeepEq(
    `[keypath('a', 'b'), EACH]`,
    v => v + 1,
    { a: { b: [1, 2, 3] } },
    { a: { b: [2, 3, 4] } }
  );

  test.done();
};

exports.KEYPATH_STRICT = test => {
  test.selectsDeepEq(`[keypathStrict('a', 'b')]`, { a: { b: 1 } }, [1]);
  test.selectsDeepEq(`[keypathStrict('a', 'b')]`, {}, [undefined]);

  test.transformsDeepEq(`[keypathStrict('a', 'b')]`, () => 2, {}, {});
  test.transformsDeepEq(
    `[keypathStrict('a', 'b')]`,
    v => v + 1,
    { a: { b: 1 } },
    { a: { b: 2 } }
  );

  test.transformsDeepEq(
    `[keypathStrict('a', 'c')]`,
    () => 2,
    { a: { b: 1 } },
    { a: { b: 1 } }
  );

  test.done();
};

exports.WHEN = test => {
  test.selectsDeepEq(
    `[EACH, when((v => v.length == 0), [1])]`,
    [[2], [], [3], []],
    [[2], [1], [3], [1]],
  );

  test.transformsDeepEq(
    `[EACH, when((v => v === 0), 1)]`,
    v => v + 1,
    [1, 0, 3, 0],
    [2, 2, 4, 2],
  );

  test.done();
};

exports.OR = test => {
  test.selectsDeepEq(`[or(true)]`, null, [true]);
  test.selectsDeepEq(`[or(true)]`, [1, 2], [[1, 2]]);

  test.selectsDeepEq(
    `[EACH, or([])]`,
    [[1], null, [3], null],
    [[1], [], [3], []],
  );

  test.transformsDeepEq(
    `[EACH, or([])]`,
    v => v + 1,
    [1, null, 3, null],
    [2, 1, 4, 1],
  );

  test.done();
};

exports.BEFORE_INDEX = test => {
  test.selectsDeepEq(
    `[beforeIndex(2)]`,
    [1, 2, 4, 5],
    [[]],
  );

  test.transformsDeepEq(
    `[beforeIndex(2)]`,
    () => [3],
    [1, 2, 4, 5],
    [1, 2, 3, 4, 5],
  );

  test.done();
};

exports.STOP = test => {
  test.selectsDeepEq(
    `[EACH, (v => v > 1)]`,
    [1, 2, 3, 4],
    [2, 3, 4],
  );

  test.selectsDeepEq(
    `[EACH, (v => v > 1), STOP]`,
    [1, 2, 3, 4],
    [],
  );

  test.transformsDeepEq(
    `[EACH, (v => v > 1)]`,
    v => v + 1,
    [1, 2, 3, 4],
    [1, 3, 4, 5],
  );

  test.transformsDeepEq(
    `[EACH, (v => v > 1), STOP]`,
    v => v + 1,
    [1, 2, 3, 4],
    [1, 2, 3, 4],
  );

  test.done();
};

exports.SELF = test => {
  test.selectsDeepEq(
    `[SELF]`,
    [1, 2, 3, 4],
    [[1, 2, 3, 4]],
  );

  test.transformsDeepEq(`[SELF]`, v => v + 1, 1, 2);

  test.done();
};

exports.SUBSELECT = test => {
  test.selectsDeepEq(
    `[subselect(OBJECT_VALS, EACH, OBJECT_VALS)]`,
    { items: [{ a: 1 }, { b: 2 }, { c: 3 }] },
    [[1, 2, 3]]
  );

  test.transformsDeepEq(
    `[subselect(OBJECT_VALS, EACH, OBJECT_VALS)]`,
    v => v.slice().reverse(),
    { items: [{ a: 1 }, { b: 2 }, { c: 3 }] },
    { items: [{ a: 3 }, { b: 2 }, { c: 1 }] },
  );

  test.transformsDeepEq(
    `[subselect(OBJECT_VALS, EACH, OBJECT_VALS), range(0, 3)]`,
    v => v.slice().reverse(),
    { items: [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 5 }] },
    { items: [{ a: 3 }, { b: 2 }, { c: 1 }, { d: 5 }] },
  );

  test.done();
};

exports.TRANSFORMED = test => {
  test.selectsDeepEq(
    `[OBJECT_VALS, map(v => v + 1)]`,
    { a: 1, b: 2, c: 3 },
    [2, 3, 4]
  );

  const incVals = transform([OBJECT_VALS], v => v + 1);
  test.deepEqual(
    incVals({ a: 1, b: 2, c: 3 }),
    { a: 2, b: 3, c: 4 }
  );

  test.selectsDeepEq(
    `[map(transform([OBJECT_VALS], v => v + 1))]`,
    { a: 1, b: 2, c: 3 },
    [{ a: 2, b: 3, c: 4 }]
  );

  test.selectsDeepEq(
    `[transformed([OBJECT_VALS], v => v + 1)]`,
    { a: 1, b: 2, c: 3 },
    [{ a: 2, b: 3, c: 4 }]
  );

  test.selectsDeepEq(
    `[transformed([OBJECT_VALS, EACH, OBJECT_VALS], v => v + 1)]`,
    { items: [{ a: 1 }, { b: 2 }, { c: 3 }] },
    [{ items: [{ a: 2 }, { b: 3 }, { c: 4 }] }]
  );

  test.done();
};

exports.REDUCED = test => {
  test.selectsDeepEq(
    `[map(v => select([EACH], v).reduce((p, n) => p + n))]`,
    [1, 2, 3, 4],
    [10]
  );

  test.selectsDeepEq(
    `[reduced([EACH], (p, n) => p + n)]`,
    [1, 2, 3, 4],
    [10]
  );

  test.done();
};

exports.MULTI_PATH = test => {
  test.selectsDeepEq(
    `[multiPath([prop('a')], [prop('b')])]`,
    { a: 0, b: 1, c: 2 },
    [0, 1]
  );

  test.transformsDeepEq(
    `[multiPath([prop('a')], [prop('b')])]`,
    v => v - 1,
    { a: 0, b: 1, c: 2 },
    { a: -1, b: 0, c: 2 }
  );

  test.transformsDeepEq(
    `[multiPath([prop('a')], [prop('b')]), EACH]`,
    v => v + 1,
    { a: [1, 2, 3], b: [1, 2, 3] },
    { a: [2, 3, 4], b: [2, 3, 4] },
  );

  test.done();
};

exports.IF_PATH = test => {
  test.selectsDeepEq(
    `[ifPath([prop('a')], [prop('b')])]`,
    { a: 0, b: 1, c: 2 },
    [1]
  );

  test.selectsDeepEq(
    `[ifPath([prop('a')], [prop('b')], [prop('c')])]`,
    { a: 0, b: 1, c: 2 },
    [1]
  );

  test.transformsDeepEq(
    `[ifPath([prop('a')], [prop('b')], [prop('c')])]`,
    v => v + 1,
    { a: 0, b: 1, c: 2 },
    { a: 0, b: 2, c: 2 }
  );

  test.transformsDeepEq(
    `[ifPath([prop('a')], [prop('b')], [prop('c')])]`,
    v => v + 1,
    { b: 1, c: 2 },
    { b: 1, c: 3 }
  );

  test.transformsDeepEq(
    `[ifPath([prop('a')], [prop('b')], [prop('c')]), EACH]`,
    v => v + 1,
    { a: [1, 2, 3], b: [1, 2, 3], c: [1, 2, 3] },
    { a: [1, 2, 3], b: [2, 3, 4], c: [1, 2, 3] },
  );

  test.done();
};

exports.COND_PATH = test => {
  test.selectsDeepEq(
    `[condPath(
       [prop('a')], [prop('b')],
       [prop('c')], [prop('d')]
     )]`,
    {
      a: 0, b: 1, c: 2, d: 3,
    },
    [1]
  );

  test.selectsDeepEq(
    `[condPath(
       [prop('a')], [prop('b')],
       [prop('c')], [prop('d')]
     )]`,
    { b: 1, c: 2, d: 3 },
    [3]
  );

  test.transformsDeepEq(
    `[condPath(
       [prop('a')], [prop('b')],
       [prop('c')], [prop('d')]
     ), EACH]`,
    v => v + 1,
    { b: 1, c: 2, d: [1, 2, 3] },
    { b: 1, c: 2, d: [2, 3, 4] },
  );

  test.done();
};

exports.COLLECT = test => {
  test.selectsDeepEq(
    `[collect(FIRST), EACH]`,
    [1, 2, 3],
    [[[1], 1], [[1], 2], [[1], 3]]
  );

  test.transformsDeepEq(
    `[collect(SELF), EACH]`,
    ([all], v) => all.reduce((p, n) => p + n, v),
    [1, 2, 3],
    [7, 8, 9]
  );

  test.selectsDeepEq(
    `[collectOne(SELF), EACH]`,
    [1, 2, 3],
    [[[1, 2, 3], 1], [[1, 2, 3], 2], [[1, 2, 3], 3]]
  );

  test.selectsDeepEq(
    `[COLLECT_CURRENT, EACH]`,
    [1, 2, 3],
    [[[1, 2, 3], 1], [[1, 2, 3], 2], [[1, 2, 3], 3]]
  );

  test.selectsDeepEq(
    `[putval(0), EACH]`,
    [1, 2, 3],
    [[0, 1], [0, 2], [0, 3]]
  );

  test.transformsDeepEq(
    `[EACH, collectOne('b'), 'a', a => a % 2 === 0]`,
    (bVal, aVal) => bVal + aVal,
    [{ a: 1, b: 3 }, { a: 2, b: -10 }, { a: 4, b: 10 }, { a: 3 }],
    [{ b: 3, a: 1 }, { b: -10, a: -8 }, { b: 10, a: 14 }, { a: 3 }]
  );

  test.done();
};

// =============================================================================

exports.multi = test => {
  test.deepEqual(
    multi(
      setval([EACH, (v => v < 0)], 0),
      setval([EACH, (v => v > 10)], 10),

      [-1, 1, 10, 14, 7, -4, 9, 5, 107, 10]
    ),
    [0, 1, 10, 10, 7, 0, 9, 5, 10, 10],
  );
  test.done();
};

// =============================================================================

exports['example-1'] = test => {
  const input = {
    a: [
      { aa: 1, bb: 2 },
      { cc: 3 },
    ],
    b: [
      { dd: 4 },
    ],
  };

  const selectOutput = [1, 3];
  const transformOutput = {
    a: [
      { aa: 2, bb: 2 },
      { cc: 4 },
    ],
    b: [
      { dd: 4 },
    ],
  };

  const path = `[OBJECT_VALS, EACH, OBJECT_VALS, (v => v % 2 !== 0)]`;
  test.selectsDeepEq(
    path,
    input,
    selectOutput
  );
  test.transformsDeepEq(path, (v => v + 1), input, transformOutput);

  // // Native - select
  test.deepEqual(
    selectOutput,
    Object
      .values(input)
      .reduce((p, n) => [...p, ...n])
      .map(v => Object.values(v))
      .reduce((p, n) => [...p, ...n])
      .filter(v => v % 2 !== 0),
  );

  // // Native - transform
  test.deepEqual(
    transformOutput,
    Object.entries(input).reduce((result, [key, value]) => {
      result[key] = value.map(val => Object.entries(val).reduce((res, [k, v]) => {
        res[k] = v % 2 !== 0 ? v + 1 : v;
        return res;
      }, {}));

      return result;
    }, {})
  );

  test.done();
};

exports['example-2'] = test => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const output = [1, 2, 3, 4, 5, 6, 8, 8];

  test.transformsDeepEq(
    `[filterer((v => v % 2 !== 0)), LAST]`,
    v => v + 1,
    input,
    output,
  );

  const [index, value] = input.reduce((res, v, i) => (
    v % 2 !== 0 ? [i, v] : res
  ), null);
  test.deepEqual(
    [...input.slice(0, index), value + 1, ...input.slice(index + 1)],
    output
  );

  test.done();
};


exports['example-other'] = test => {
  test.transformsDeepEq(
    `[EACH, 'a', (v => v % 2 === 0)]`,
    v => v + 1,
    [{ a: 1 }, { a: 2 }, { a: 4 }, { a: 3 }],
    [{ a: 1 }, { a: 3 }, { a: 5 }, { a: 3 }]
  );

  test.selectsDeepEq(
    `[EACH, EACH, (v => 0 === v % 3)]`,
    [[1, 2, 3, 4], [], [5, 3, 2, 18], [2, 4, 6], [12]],
    [3, 3, 18, 6, 12]
  );

  // Replace the subsequence from indices 2 to 4 with [:a :b :c :d :e]:
  test.transformsDeepEq(
    `[range(2, 4)]`,
    (() => ['a', 'b', 'c', 'd', 'e']),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [0, 1, 'a', 'b', 'c', 'd', 'e', 4, 5, 6, 7, 8, 9]
  );

  // Concatenate the sequence [:a :b] to every nested sequence of a sequence:
  test.transformsDeepEq(
    `[EACH, END]`,
    (() => ['a', 'b']),
    [[1], [1, 2], ['c']],
    [[1, 'a', 'b'], [1, 2, 'a', 'b'], ['c', 'a', 'b']],
  );

  // Reverse the positions of all even numbers between indices 4 and 11:
  test.transformsDeepEq(
    `[range(4, 11), filterer(v => v % 2 === 0)]`,
    (v => v.slice().reverse()),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [0, 1, 2, 3, 10, 5, 8, 7, 6, 9, 4, 11, 12, 13, 14, 15]
  );

  // Append [:c :d] to every subsequence that has at least two even numbers:
  test.transformsDeepEq(
    `[EACH, keep(c => c.filter(v => v % 2 === 0).length > 1), END]`,
    (() => ["c", "d"]),
    [[1, 2, 3, 4, 5, 6], [7, 0, -1], [8, 8], []],
    [[1, 2, 3, 4, 5, 6, 'c', 'd'], [7, 0, -1], [8, 8, 'c', 'd'], []]
  );

  test.done();
};

// =============================================================================

(() => {
  function selects(check, path, structure, value) {
    const selected = select(eval(path), structure);
    this[check](
      selected,
      value,
      `
 SELECT ${path} from ${JSON.stringify(structure)}
 result: ${JSON.stringify(selected)}
 expected: ${JSON.stringify(value)}
  `
    );
  }

  function transforms(check, path, f, structure, value) {
    const trans = transform(eval(path), f, structure);
    this[check](
      trans,
      value,
      `
 TRANSFORM ${path} from ${JSON.stringify(structure)}
 result: ${JSON.stringify(transformed)}
 expected: ${JSON.stringify(value)}
  `
    );
  }

  Object.keys(exports).forEach(testName => {
    const testFn = exports[testName];
    exports[testName] = test =>
      testFn({
        ...test,
        selectsEq: selects.bind(test, 'strictEqual'),
        selectsDeepEq: selects.bind(test, 'deepEqual'),
        transformsEq: transforms.bind(test, 'strictEqual'),
        transformsDeepEq: transforms.bind(test, 'deepEqual'),
      });
  });
})();
