'use strict';

module.exports = () => {
  const mongodbUrl = process.env.MONGO_DB || 'mongodb://127.0.0.1:27017/';
  const mongoose = {
    client: {
      url: mongodbUrl,
      options: {},
    },
  };

  return {
    mongoose,
  };
};
