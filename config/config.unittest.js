'use strict';

module.exports = () => {
  const mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/test',
      options: {},
    },
  };

  return {
    mongoose,
    security: {
      csrf: {
        ignore(ctx) {
          return ctx.ip.startsWith('127');
        },
      },
    },
  };
};
