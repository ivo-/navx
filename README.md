## navx

  A tool to elegantly manipulate ~~deeply nested~~ JavaScript data structures.

### Installation

Install from npm:

```
$ npm install --save navx
```

### What is it

Standard functional toolbox - `map`, `filter`, `reduce` is not really elegant at handling nested data structures. It is perfectly capable at dealing with ones that have max one or two levels of nesting. Navx elegantly handles deeply nested scenarios while remaining more concise than traditional methods even for the simple cases. Approach here is conceptually related to functional lenses and zippers. Some alternative explanations of what Navx is:

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

### Rationale

Performing an immutable transformations in a nested data structure results in hard
to read, complex code (as shown in the example above). The reason for that is
you have to write code to reconstruct all intermediate structures along
the way. This is the result of using tools that are not designed for nested
data and a perfect example of [incidental
complexity](https://www.infoq.com/presentations/Simple-Made-Easy). The code that
matters is just a fraction, compared to the boilerplate.

We need an abstraction to navigate and transform just the desired part of the
data structure, without all the error-prone, boilerplate code along the
way. In `Navix` you describe the path your want to manipulate using
`navigators` and then use this path to select or transform navigated data. This
approach results in simple, fast and elegant code for arbitrary nested
data structures.

`Navix` doesn't provide some tricky DSL, everything is just data. Navigators are first-class
objects that are grouped in array and then composed together.

### What to expect from using Navix

- It really shines the more complex the example gets.
- It is single tool you can learn and use for both data selection and
  transformation.
- It initally feels unnatural, but when you grok it, you will wonder how you've
  ever lived without it.
- You will find yourself using it even in the most simple cases, as it becomes
  a new way of thinking about data transformations.
- You will find it especially useful combined with immutability libraries like
  [Redux](https://redux.js.org/) or working with JSON APIs.
- You will miss it in your other programming languages (except in Clojure :))
- 0 dependency, small size library

### Navigators

Navix has an extremely simple core, just a single abstraction called
`navigator`. Queries and transforms are done by composing navigators into a
`path` precisely targeting what you want to select or change. Navigators can
be composed with other navigators, allowing sophisticated manipulations to
be expressed very concisely.

`Navix` transforms always target precise parts of a data structure, leaving
everything else the same.

*Selection steps*:

- *navigate* to the desired parts of the data structure.
- *select* those parts in array. And if you want just to select navigated
  values this is the last step.

*Added transformation steps*:

- *transform* all collected values with the provided function.
- *reconstruct* the original data structure.

*Understanding navigation*:
```js
const input = {
  a: [
    { aa: 1, bb: 2 },
    { cc: 3 },
  ],
  b: [
    { dd: 4 },
  ],
};

// Navigate to each of the object values
select([OBJECT_VALS], data);
//=> [[{ aa: 1, bb: 2 }, { cc: 3 }], [{ dd: 4 }]]

// ...
// then navigate to each of the items of object values (as object
// values are arrays)
select([OBJECT_VALS EACH], data);
//=> [{ aa: 1, bb: 2 }, { cc: 3 }, { dd: 4 }]

// ...
// then navigate to object values of each of the items of the object values of
// the initial structure (as they also are objects)
select([OBJECT_VALS, EACH, OBJECT_VALS], data);
//=> [1, 2, 3, 4]

// ...
// of all the navigated values, navigate only to odd ones
select([OBJECT_VALS, EACH, OBJECT_VALS, (v => v % 2 !== 0)], data);
//=> [1, 3]
```

*Defining navigator*:

```js
export const OBJECT_VALS = {
  select(structure, nextFn) {
    Object.values(structure).forEach(v => nextFn(v));
  },

  transform(structure, nextFn) {
    return Object.keys(structure).reduce((result, k) => (
      result[k] = nextFn(structure[k]), result
    ), {});
  },
};
```

There are two functions you need to define for a navigator, one for querying -
`select` and one for transforming - `transform`. Querying function should call
the provided `nextFn` for all the parts of the structure that this navigator
will navigate to. Transforming function will do almost the same, but it also
needs to reconstruct and return the original structure along the way. Some
navigators behave differently for different data structures and in this case
you should define multiple select/transform pairs.

To achieve select or transform, all the navigators are composed and reduced with
the data structure you want to operate on.

### Supported operations

#### Select
Always returns an array of the navigated values:

```js
select([EACH, (v => v > 0)], [-1, 2, -3, 0, 4]);
// => [2, 4]
```

#### Transform

Returns the original data structure with navigated values transformed,
using the provided function.

```js
transform([EACH, (v => v < 0)], (v => v * v), [-1, 2, -3, 0, 4]);
// => [1, 2, 9, 0, 4]
```

#### Set value

A thin transform wrapper, that sets a constant value for the navigated
items, instead of transforming them with function.

```js
setval([EACH, (v => v < 0)], 0, [-1, 2, -3, 0, 4]);
// => [0, 2, 0, 0, 4]
```

Some navigators like `range` or `submap` navigate to a part of the data
structure and we can use them to replace the whole part, like we do with values:

```js
setval([range(1, 2)], [1, 0, 4, 5], [2, 3]);
// => [1, 2, 3, 4, 5]
```

#### Multi

Multiple operations at once. Note that `navix` functions are automatically
curried.

```js
multi(
  setval([EACH, (v => v < 0)], 0),
  setval([EACH, (v => v > 10)], 10),

  [-1, 1, 10, 14, 7, -4, 9, 5, 107, 10]
);
// => [0, 1, 10, 10, 7, 0, 9, 5, 10, 10]
```

### Learning

- [DOCUMENTATION](./DOCS.md)
- Check the `navigators.js` and `navigators_spec.js`.
- Check [Specter](https://github.com/nathanmarz/specter)

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
  [EACH, 'a', (v => v % 2 === 0)],
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

**Example 9: Reverse values in all objects in array**

This example illustrates one of the most powerful navigtors in navix -
`subselect`. Subselect navigates to array of selected values from provided path
and this array is a view of the original structure.

```js
transform(
  [subselect(EACH, OBJECT_VALS)],
  v => v.slice().reverse(),
  [{ a: 1}, { b: 2 }, { c: 3 }]
)
// => [{ a: 3}, { b: 2 }, { c: 1 }]
```

**Example 10: Collecting values**

When doing more involved transformations, you often find you lose context when
navigating deep within a data structure and need information "up" the data
structure to perform the transformation. Navix solves this problem by allowing
you to collect values during navigation to use in the transform function. Here's
an example which transforms an array of objects by adding the value of the `b`
key to the value of the `a` key, but only if the `a` key is even:

```js
transform(
  [EACH, collectOne('b'), 'a', a => a % 2 !== 0],
  (bVal, aVal) => aVal + aVal,
  [{ a: 1, b: 3 }, { a: 2, b: -10 }, { a: 4, b: 10 }, { a: 3 }]
);
// => [{ b: 3, a: 1 }, { b: -10, a: -8 }, { b: 10, a: 14 }, { a: 3 }]
```

### Using with React/Redux

Check this [example](https://gist.github.com/ivo-/3cd95288fe3afe234adce90687107ca8).

### License
Copyright 2015-2018 Red Planet Labs, Inc. Specter is licensed under Apache License v2.0.

Copyright 2018-present Ivailo Hristov under The MIT License (MIT)
