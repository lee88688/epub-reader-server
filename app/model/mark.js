'use strict';

module.exports = app => {
  const { mongoose: { Schema, model } } = app;
  const markSchema = new Schema({
    type: {
      type: String,
      required: true,
    },
    epubcfi: {
      type: String,
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    content: String,
  });
  return model('Mark', markSchema);
};
