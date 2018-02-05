import { keep } from './navigators';

export function select(...args) {
  const result = [];
  const _select = (navigator, data) => {
    if (navigator.length > 0) {
      const nav = Array.isArray(navigator[0]) ? navigator[0][0] : navigator[0];
      const navArgs = Array.isArray(navigator[0]) ? navigator[0].slice(1) : [];

      const res = typeof nav === 'function'
        ? _select([keep(nav), ...navigator.slice(1)], data)
        : nav.select(
          navArgs,
          data,
          _select.bind(this, navigator.slice(1)),
        );

      return res;
    }

    result.push(data);
    return data;
  };

  _select(...args);
  return result;
}

export function transform(navigator, f, data) {
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
      transform.bind(this, navigator.slice(1), f),
    );
  }

  return f(data);
}

export function selectOne(navigator, data) {
  const result = select(navigator, data);
  return result[0];
}

export function setval(navigator, val, data) {
  return transform(navigator, (() => val), data);
}
