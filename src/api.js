const { keep } = require('./navigators');

function autocurry(fn) {
  const { length } = fn;

  return function next(...args) {
    if (args.length < length) {
      return next.bind(this, ...args);
    }

    return fn(...args);
  };
}

function select(...args) {
  const result = [];
  const _select = (navigator, data) => {
    if (navigator.length > 0) {
      const nav = Array.isArray(navigator[0]) ? navigator[0][0] : navigator[0];
      const navArgs = Array.isArray(navigator[0]) ? navigator[0].slice(1) : [];

      const res =
        typeof nav === 'function'
          ? _select([keep(nav), ...navigator.slice(1)], data)
          : nav.select(navArgs, data, _select.bind(this, navigator.slice(1)));

      return res;
    }

    result.push(data);
    return data;
  };

  _select(...args);
  return result;
}

function transform(navigator, f, data) {
  if (typeof f !== 'function') throw new Error(`${f} is not a function.`);

  if (navigator.length > 0) {
    const nav = Array.isArray(navigator[0]) ? navigator[0][0] : navigator[0];
    const args = Array.isArray(navigator[0]) ? navigator[0].slice(1) : [];

    if (typeof nav === 'function') {
      return transform([keep(nav), ...navigator.slice(1)], f, data);
    }

    return nav.transform(
      args,
      data,
      transform.bind(this, navigator.slice(1), f)
    );
  }

  return f(data);
}

function selectOne(navigator, data) {
  const result = select(navigator, data);
  return result[0];
}

function setval(navigator, val, data) {
  return transform(navigator, () => val, data);
}

function multi(...args) {
  const ops = args.slice(0, -1);
  const data = args[args.length - 1];

  return ops.reduce((res, op) => op(res), data);
}

module.exports = {
  setval: autocurry(setval),
  select: autocurry(select),
  selectOne: autocurry(selectOne),
  transform: autocurry(transform),

  multi,
};
