  - [EACH](#each)
  - [FIRST](#first)
  - [LAST](#last)
  - [END](#end)
  - [BEGINNING](#beginning)
  - [AFTER_ELEM](#after_elem)
  - [BEFORE_ELEM](#before_elem)
  - [OBJECT_VALS](#object_vals)
  - [OBJECT_KEYS](#object_keys)
  - [filterer()](#filtererpredfunction)
  - [prop()](#propkeystringnumber)
  - [INDEXED_VALS](#indexed_vals)
  - [skip()](#skippredfunction)
  - [keep()](#keeppredfunction)
  - [map()](#mapfnfunction)
  - [range()](#rangestartnumberendnumber)
  - [rangeDynamic()](#rangedynamicstartfnfunctionendfnfunction)
  - [propName()](#propnamepredstringnumber)
  - [submap()](#submapkeysarray)
  - [keypath()](#keypath)
  - [keypathStrict()](#keypathstrict)
  - [when()](#whenpredfunctionvalany)
  - [or()](#orvalany)
  - [beforeIndex()](#beforeindexinumber)
  - [STOP](#stop)
  - [SELF](#self)
  - [subselect()](#subselect)
  - [transformed()](#transformedpatharrayfnfunction)
  - [reduced()](#reducedpatharrayfnfunction)
  - [multiPath()](#multipath)
  - [ifPath()](#ifpathcheckpatharraythenpatharrayelsepatharray)
  - [condPath()](#condpathcheckpatharraythenpatharray)
  - [collect()](#collect)
  - [collectOne()](#collectone)
  - [COLLECT_CURRENT](#collect_current)
  - [putval()](#putvalvany)

## EACH

  Navigates to every item in Array or [key, value] pair for object.
  
  
```js
select([EACH], [1, 2, 3])
// => [1, 2, 3]
```

  
```js
transform([EACH], v => v + 1, [1, 2, 3])
// => [2, 3, 4]
```

  
```js
select([EACH], {a: 1, b: 2})
// => [['a', 1], ['b', 2]]
```

  
```js
transform([EACH], (v => v.slice().reverse()), {a: 1, b: 2})
// => {1: 'a', 2: 'b'}
```

## FIRST

  Navigates to first item in Array.
  
```js
select([FIRST], [1, 2, 3]);
// => [1]
```

  
```js
setval([FIRST], 0, [1, 2, 3]);
// => [0, 2, 3]
```

## LAST

  Navigates to last item in Array.
  
```js
select([LAST], [1, 2, 3]);
// => [3]
```

  
```js
setval([LAST], 0, [1, 2, 3]);
// => [1, 2, 0]
```

## END

  Navigates to the empty array after the end of a array. Useful to add
  multiple values to array.
  
```js
setval([END], [4, 5], [1, 2, 3]);
// => [1, 2, 3, 4, 5]
```

## BEGINNING

  Navigates to the empty array before the beginning of a array. Useful to add
  multiple values to array.
  
```js
setval([BEGINNING], [-1, 0], [1, 2, 3]);
// => [-1, 0, 1, 2, 3]
```

## AFTER_ELEM

  Navigates to the void element after the end of a array. Useful to add
  single value to array.
  
```js
setval([AFTER_ELEM], 4, [1, 2, 3]);
// => [1, 2, 3, 4]
```

## BEFORE_ELEM

  Navigates to the void element before the beginning of a array. Useful to add
  single value to array.
  
```js
setval([BEFORE_ELEM], 0, [1, 2, 3]);
// => [0, 1, 2, 3]
```

## OBJECT_VALS

  Navigates to each value of an Object.
  
```js
select([OBJECT_VALS], { a: 1, b: 2 });
// => [1, 2]
```

  
```js
transform([OBJECT_VALS], v => v + 2, { a: 1, b: 2 });
// => { a: 3, b: 4 }
```

  
```js
select([OBJECT_VALS, OBJECT_VALS], { a: { b: 'c' }, d: { e: 'f' } });
// => ['c', 'f']
```

## OBJECT_KEYS

  Navigates to each key of an Object.
  
```js
select([OBJECT_KEYS], { a: 1, b: 2 });
// => ['a', 'b']
```

  
```js
transform([OBJECT_KEYS], v => v + v, { a: 1, b: 2 });
// => { aa: 1, bb: 2 }
```

  
```js
select([OBJECT_VALS, OBJECT_KEYS], { a: { b: 'c' }, d: { e: 'f' } });
// => ['b', 'e']
```

## filterer(pred:Function)

  Navigates to Array formed from filtering other Array.
  
```js
select([filterer(v => v % 2 === 0)], [1, 2, 3, 4, 5]);
// => [[2, 4]]
```

  
```js
transform([filterer(v => v % 2 === 0)], () => [20, 40], [1, 2, 3, 4, 5]);
// => [1, 20, 3, 40, 5]
```

## prop(key:String|Number)

  Navigates to a property value in Object or index value in Array.
  
```js
select([prop('a')], { a: 1, b: 2 });
// => [1]
```

  
```js
setval([prop('a')], 0, { a: 1, b: 2 });
// => { a: 0, b: 2 }
```

## INDEXED_VALS

  Navigates to each [elem, index] pair in Array.
  
```js
select([INDEXED_VALS], [1, 2, 3]);
// => [[1, 0], [2, 1], [3, 2]]
```

  
```js
transforms([INDEXED_VALS], ([v, i]) => ([i * 2, v - 1]), [1, 2, 3])
// => [0, 2, 4]
```

## skip(pred:Function)

  Navigates to structure only if `pred(structure)` is false.
  
```js
select([EACH, skip(v => v % 2 !== 0)], [2, 3, 4]);
// => [2, 4]
```

## keep(pred:Function)

  Navigates to structure only if `pred(structure)` is true.
  
```js
select([EACH, keep(v => v % 2 !== 0)], [2, 3, 4]);
// => [3]
```

## map(fn:Function)

  Navigates to `fn(structure)`.
  
```js
select([map(() => true)], false);
// => [true]
```

  
```js
select([map(Object.values)], { a: 1, b: 2 });
// => [[1, 2]]
```

  
```js
transform([EACH, map(v => v + 1)], v => v + 1, [1, 2, 3, 4]);
// => [3, 4, 5, 6]
```

## range(start:Number, end:Number)

  Navigates to the sub-array bound by the indexes start (inclusive) and end
  (exclusive).
  
```js
select([range(0, 2)], [1, 2, 3, 4]);
// => [[1, 2]]
```

  
```js
transform([range(0, 2)], () => [0, 0], [1, 2, 3, 4]);
// => [0, 0, 3, 4]
```

## rangeDynamic(startFn:Function, endFn:Function)

  Navigates to the sub-array bound by the indexes created by startFn(structure)
  (inclusive) and endFn(structure).
  
```js
select([rangeDynamic(() => 0, () => 2)], [1, 2, 3, 4]);
// => [[1, 2]]
```

  
```js
transform([rangeDynamic(() => 0, () => 2)], () => [0, 0], [1, 2, 3, 4]);
// => [0, 0, 3, 4]
```

## propName(pred:String|Number)

  Navigates to a key in object (index in array), not the value.
  
```js
select([propName('a')], { a: 1, b: 2 });
// => ['a']
```

  
```js
setval([prop('a')], 'c', { a: 1, b: 2 });
// => { c: 1, b: 2 }
```

## submap(keys:Array)

  Navigates to a submap of the original map.
  
```js
select([submap(['a', 'b'])], { a: 1, b: 2, c: 3 });
// => [{ a: 1, b: 2 }]
```

  
```js
transform([submap(['a', 'b'])], () => ({ d: 4 }), { a: 1, b: 2, c: 3 });
// => { c: 3, d: 4 }
```

## keypath()

  Navigates to the value in specified keys path or `undefined` if the path
  doesn't exist in the structure.
  
```js
select([keypath('a', 'b')], { a: { b: 1 } });
// => [1]
```

  
```js
select([keypath('a', 'b')], {});
// => [undefined]
```

  
```js
transform([keypathStrict('a', 'b')], v => v + 1, {});
// => { a: { b: 2 } }
```

## keypathStrict()

  Same as `keypath`, but stops navigation if the path doesn't exist
  in structure.
  
```js
transform([keypathStrict('a', 'b')], v => v + 1, {});
// => {}
```

## when(pred:Function, val:Any)

  Navigates to the structure if `pred(structure)` is false, else navigate to
  the provided argument.
  
```js
select([EACH, when((v => v.length == 0), [1])], [[2], [], [3], []]);
// => [[2], [1], [3], [1]]
```

## or(val:Any)

  Navigates to the value if it is not `null` or `undefined`, else navigate to
  the provided argument.
  
```js
select([EACH, or([1])], [[2], null, [3], null]);
// => [[2], [1], [3], [1]]
```

## beforeIndex(i:Number)

  Navigates to empty sub-array before selected index and previous index. It
  is useful to insert one or multiple elements before selected index.
  
```js
setval([beforeIndex(2)], [3], [1, 2, 4, 5]);
// => [1, 2, 3, 4, 5]
```

## STOP

  For select, stops navigation and returns empty result. For transform,
  returns structure unchanged.

## SELF

  Navigates to the structure unchanged.
  
```js
transform([SELF], v => v + 1, 1);
// => 2
```

## subselect()

  Like `filterer` but instead of predicate accepts `path`. Navigates to array
  of selected values, but this array is `view` of the original structure and
  can be transformed.
  
```js
transform(
  [subselect(OBJECT_VALS, EACH, OBJECT_VALS)],
  v => v.slice().reverse(),
  {:items [{ a: 1}, { b: 2 }, { c: 3 }]}
)
// => {:items [{ a: 3}, { b: 2 }, { c: 1 }]}
```

## transformed(path:Array, fn:Function)

  Navigates to `transform(path, fn, structure)`.
  
```js
select([transformed([OBJECT_VALS], v => v + 1)], { a: 1, b: 2, c: 3 });
// => [{ a: 2, b: 3, c: 4 }]
```

## reduced(path:Array, fn:Function)

  Navigates to a view of the current structure by transforming with a reduction
  over the selected values.
  
```js
select([reduced([EACH], (p, n) => p + n)], [1, 2, 3, 4]);
// => [10]
```

## multiPath()

  Navigates to all the items in all the pats. For transforms, applies updates
  to the paths in order. It is like calling select/transform multiple times.
  
```js
select([multi-path([prop('a')], [prop('b')])], {a: 0, b: 1, c: 2});
// => [0, 1]
```

  
```js
transform(
  [multi-path([prop('a')], [prop('b')])],
  v => v - 1,
  { a: 0, b: 1, c: 2 }
);
// => { a: -1, b: 0, c: 2 }
```

## ifPath(checkPath:Array, thenPath:Array, elsePath:Array)

  Tests if selecting with `checkPath` on the current structure returns
  anything. If so, it navigates to the corresponding `thenPath`, if not -
  navigates to `elsePath`.
  
```js
transform(
  [ifPath([prop('a')], [prop('b')], [prop('c')])],
  v => v + 1,
  { a: 0, b: 1, c: 2 }
);
// => { a: 0, b: 2, c: 2 }
```

  
```js
transform(
  [ifPath([prop('a')], [prop('b')], [prop('c')])],
  v => v + 1,
  { b: 1, c: 2 }
);
// => { b: 1, c: 3 }
```

## condPath(checkPath:Array, thenPath:Array)

  Tests if selecting with `checkPath` on the current structure returns
  anything. If so, it navigates to the corresponding `thenPath`, otherwise, it
  tries the next `checkPath`. If nothing matches, then the structure is not
  selected.
  
```js
select(
  [condPath(
    [prop('a')], [prop('b')],
    [prop('c')], [prop('d')],
```

  
```js
    [prop('e')]
  )],
  { b: 1, d: 3, e: 4 }
);
// => 4
```

  
```js
transform(
   [condPath(
     [prop('a')], [prop('b')],
     [prop('c')], [prop('d')]
   ), EACH],
   v => v + 1,
   { b: 1, c: 2, d: [1, 2, 3] }
 );
 // => { b: 1, c: 2, d: [2, 3, 4] }
```

## collect()

  Adds the result of running `select` with given path to the array of
  collected values. Note that `collect`, like `select`, returns an array
  containing its results. If transform is called, each collected value will be
  passed as an argument to the transforming function with the resulting value
  as the last argument.
  
```js
select(
  [collect(FIRST), EACH],
  [1, 2, 3]
);
// => [[[1], 1], [[1], 2], [[1], 3]]
```

  
   transform(
```js
  [collect(SELF), EACH],
  ([all], v) => all.reduce((p, n) => p + n, v),
  [1, 2, 3],
);
// => [7, 8, 9]
```

## collectOne()

  Same as `collect`, but uses `selectOne`.
  
  See: `collect`

## COLLECT_CURRENT

  Same as `collectOne(SELF)`. Collects current value.
  
  See: `collect`, `collectOne`

## putval(v:Any)

  Adds `v` to collected items.
  
  See: `collect`
