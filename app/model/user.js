'use strict';

module.exports = app => {
  const { mongoose: { Schema, model } } = app;
  const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
  });
  return model('User', userSchema);
};
