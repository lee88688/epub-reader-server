'use strict';

module.exports = app => {
  const { mongoose: { Schema, model } } = app;
  const bookSchema = new Schema({
    // name: String,
    // description: String,
    // cover: String,
    fileName: String,
    user: Schema.Types.ObjectId,
    content: Schema.Types.Mixed, // use to store object parsed from xml
  });
  bookSchema.virtual('contentMetadata').get(function() {
    const { content: { package: p } = {} } = this;
    if (!p) return {};
    return p.metadata[0];
  });
  bookSchema.virtual('title').get(function() {
    const title = this.contentMetadata['dc:title'] || '';
    return title.length ? title[0] : title;
  });
  bookSchema.virtual('description').get(function() {
    const description = this.contentMetadata['dc:description'] || '';
    return description.length ? description[0] : description;
  });
  return model(bookSchema);
};
