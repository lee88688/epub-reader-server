'use strict';

module.exports = app => {
  const { mongoose: { Schema, model } } = app;
  const bookSchema = new Schema({
    name: String,
    description: String,
    cover: String,
    fileName: String,
    user: Schema.Types.ObjectId,
  });
  return model(bookSchema);
};
