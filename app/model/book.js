'use strict';

module.exports = app => {
  const { mongoose: { Schema, model } } = app;
  const bookSchema = new Schema({
    title: String,
    description: String,
    cover: String,
    fileName: String,
    user: Schema.Types.ObjectId,
    content: Schema.Types.Mixed, // use to store object parsed from xml
  });
  bookSchema.virtual('contentMetadata').get(function() {
    const { content: { package: p } = {} } = this;
    if (!p) return {};
    return p.metadata[0];
  });
  /**
   * get meta
   * @param {String} name meta name attribute
   */
  bookSchema.methods.getMetaFromName = function(name) {
    const metadata = this.contentMetadata;
    const meta = metadata.meta || [];
    const res = meta.find(({ $: { name: mName } }) => mName === name);
    if (!res) return null;
    return res.$.content;
  };
  /**
   * get metadata key value
   * @param {String} key metadata key without dc namespace.
   */
  bookSchema.methods.getMetadataFromKey = function(key) {
    if (!key) {
      app.logger.warn('model Book method(getMetadataFromKey) get empty key.');
      return;
    }
    const metadata = this.contentMetadata;
    const internalKey = `dc:${key}`;
    const value = metadata[internalKey] || metadata[key] || [];
    /**
     * if xml item does not contain attributes(<tag>xxx</tag>), array item is just a string,
     * in contrast, array item is an object like ({ _: 'xxx', $: {} })
     */
    return value.length ? value.map(item => (item._ ? item._ : item)).join(',') : '';
  };
  /**
   * get manifest using id
   * @param {String} id manifest id
   */
  bookSchema.methods.getManifestItemFromId = function(id) {
    const { content: { package: p } = {} } = this;
    if (!p) return {};
    const manifest = p.manifest[0];
    const items = manifest.item || [];
    const item = items.find(({ $ }) => $.id === id);
    return item ? item.$ : null;
  };
  bookSchema.methods.fillInBaseInfo = function() {
    if (!this.content) {
      app.logger.warn('fill in base info before setting content.');
      return;
    }
    this.title = this.getMetadataFromKey('title');
    this.description = this.getMetadataFromKey('description');
    const coverId = this.getMetaFromName('cover');
    const coverItem = this.getManifestItemFromId(coverId);
    this.cover = coverItem.href;
  };
  return model('Book', bookSchema);
};
