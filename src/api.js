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

function select(_navigator, _data) {
  const result = [];
  const _select = (navigator, data, collected) => {
    collected = collected.slice();
    if (navigator.length > 0) {
      const nav = Array.isArray(navigator[0]) ? navigator[0][0] : navigator[0];
      const navArgs = Array.isArray(navigator[0]) ? navigator[0].slice(1) : [];

      const res =
        typeof nav === 'function'
          ? _select([keep(nav), ...navigator.slice(1)], data, collected)
          : nav.select(
            navArgs,
            data,
            d => _select(navigator.slice(1), d, collected),
            collected
          );

      return res;
    }

    if (collected.length) {
      result.push([...collected, data]);
    } else {
      result.push(data);
    }
    return data;
  };

  _select(_navigator, _data, []);

  return result;
}

function transform(_navigator, _f, _data) {
  return ((function _transform(navigator, f, data, collected) {
    if (typeof f !== 'function') throw new Error(`${f} is not a function.`);

    collected = collected.slice();
    if (navigator.length > 0) {
      const nav = Array.isArray(navigator[0]) ? navigator[0][0] : navigator[0];
      const args = Array.isArray(navigator[0]) ? navigator[0].slice(1) : [];

      if (typeof nav === 'function') {
        return _transform([keep(nav), ...navigator.slice(1)], f, data, collected);
      }

      return nav.transform(
        args,
        data,
        d => _transform(navigator.slice(1), f, d, collected),
        collected
      );
    }

    return f(...[...collected, data]);
  })(_navigator, _f, _data, []));
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
