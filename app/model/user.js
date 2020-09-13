'use strict';

module.exports = app => {
  const { mongoose: { Schema, model } } = app;
  const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    categories: {
      type: Map,
      of: String,
    },
  });
  return model('User', userSchema);
};
