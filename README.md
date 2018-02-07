## navx

  A tool to elegantly manipulate ~~deeply nested~~ JavaScript data structures.

### Installation

Install from npm:

```
$ npm install --save navx
```

### What is it

Standard functional toolbox - `map`, `filter`, `reduce` is not really elegant at handling nested data structures. It is perfectly capable at dealing with ones that have max one or two levels of nesting. Navx elegantly handles deeply nested scenarios while remaining more concise than traditional methods even for the simplest cases. Approach here is conceptually related to functional lenses and zippers. Some alternative explanations of what Navx is:

- A port of the Clojure's super awesome [Specter](https://github.com/nathanmarz/specter) library with adapted semantics for JavaScript.
- A single tool for both data querying and transformation with minimum code duplication.
- In some cases it can be viewed like a substitution for the built-in data transformations in JavaScript, in other cases - like supplement to them.

### Usage

Don't be scared we will explain it in details later.

**Increment every odd number nested within object of array of objects**

*Initial data:*
```js
const data = {
  a: [
    { aa: 1, bb: 2 },
    { cc: 3 },
  ],
  b: [
    { dd: 4 },
  ],
};
```

*Solution with navx:*
```js
// Include the library
import {
  // API
  select, transform

  // Navigators
  OBJECT_VALS, EACH
} form 'navx';

// Construct the path you want to work with
const path = [OBJECT_VALS, EACH, OBJECT_VALS, (v => v % 2 !== 0)];

// Select data from the path
select(path, data);
// => [1, 3]

// Transform data from the path
transform(path, (v => v + 1), data);
// =>
// {
//  a: [
//    { aa: 2, bb: 2 },
//    { cc: 4 },
//  ],
//  b: [
//    { dd: 4 },
//  ],
// }
```

*Solution with native tools:*
```js
// Native - select
Object
  .values(data)
  .reduce((p, n) => [...p, ...n])
  .map(v => Object.values(v))
  .reduce((p, n) => [...p, ...n])
  .filter(v => v % 2 !== 0),

// Native - transform
Object.entries(data).reduce((result, [key, value]) => {
  result[key] = value.map(val => {
    return Object.entries(val).reduce((res, [k, v]) => {
      res[k] = v % 2 !== 0 ? v + 1 : v;
      return res;
    }, {});
  });

  return result;
}, {})
```

### Other examples

**Example 2: Increment the last odd number in array**

```js
const data = [1, 2, 3, 4, 5, 6, 7, 8];

// Navx
transform([EACH, (v => v % 2 !== 0), LAST], (v => v + 1), data);
// => [1, 2, 3, 4, 5, 6, 8, 8]

// Navx (alternative)
transform([filterer((v => v % 2 !== 0)), LAST], (v => v + 1), data);

// Native
const [index, value] = data.reduce((res, v, i) => (
  v % 2 !== 0 ? [i, v] : res
), null)
const result = [...data.slice(0, index), value + 1, ...data.slice(index + 1)];
```

**Example 3: Increment all the even values for `a` keys in array of maps:**
```js
transforms(
  [EACH, prop('a'), (v => v % 2 === 0)],
  v => v + 1,
  [{ a: 1 }, { a: 2 }, { a: 4 }, { a: 3 }]
);
// => [{ a: 1 }, { a: 3 }, { a: 5 }, { a: 3 }]
```

**Example 4: Retrieve every number divisible by 3 out of array of arrays:**
```js
select(
  [EACH, EACH, (v => 0 === v % 3)],
  [[1, 2, 3, 4], [], [5, 3, 2, 18], [2, 4, 6], [12]]
);
// => [3, 3, 18, 6, 12]
```

**Example 5: Replace the array from indices 2 to 4 with ['a', 'b', 'c' 'd', 'e']:**
```js
transform(
  [range(2, 4)],
  (() => ['a', 'b', 'c', 'd', 'e']),
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
);
// => [0, 1, 'a', 'b', 'c', 'd', 'e', 4, 5, 6, 7, 8, 9]
```

**Example 6: Concatenate the array ['a', 'b'] to every nested array of an array:**
```js
transform(
  [EACH, END],
  (() => ['a', 'b']),
  [[1], [1, 2], ['c']],
);
// => [[1, 'a', 'b'], [1, 2, 'a', 'b'], ['c', 'a', 'b']],
```

**Example 7: Reverse the positions of all even numbers between indices 4 and 11:**
```js
transform(
  [range(4, 11), filterer(v => v % 2 === 0)],
  (v => v.slice().reverse()),
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
);
// => [0, 1, 2, 3, 10, 5, 8, 7, 6, 9, 4, 11, 12, 13, 14, 15]
```

**Example 8: Append ['c', 'd'] to every array that has at least two even numbers:**
```js
transform(
  [EACH, (c => c.filter(v => v % 2 === 0).length > 1), END],
  (() => ["c", "d"]),
  [[1, 2, 3, 4, 5, 6], [7, 0, -1], [8, 8], []],
);
// => [[1, 2, 3, 4, 5, 6, 'c', 'd'], [7, 0, -1], [8, 8, 'c', 'd'], []]
```

### Learning:

- Check the `navigators.js` and `navigators_spec.js`
- http://nathanmarz.com/blog/clojures-missing-piece.html

### Contributing
