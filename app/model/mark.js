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
    color: String, // for highlight only
    title: String,
    content: String,
    selectedString: String,
  });
  return model('Mark', markSchema);
};
