const api = require('./api');
const navigators = require('./navigators');
const navigatorsMeta = require('./navigators-meta');

module.exports = {
  ...api,
  ...navigators,
  ...navigatorsMeta,
};
