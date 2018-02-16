const api = require('./api');
const navigators = require('./navigators');

module.exports = {
  ...navigators,
  ...api,
};
