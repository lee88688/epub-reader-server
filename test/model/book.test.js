'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

describe('test/model/book.test.js', () => {
  let book;
  before(async () => {
    const ctx = app.mockContext();
    const { model } = ctx;
    book = new model.Book({ fileName: 'test' });
    const data = await fs.promises.readFile(path.join(app.config.baseDir, 'test/assets/content.opf'));
    const content = await xml2js.parseStringPromise(data.toString('utf8'));
    book.content = content;
  });
  it('metadata', () => {
    // eslint-disable-next-line no-script-url
    assert(book.getMetadataFromKey('title') === 'JavaScript: The Good Parts');
    assert(book.getMetadataFromKey('publisher') === 'Yahoo Press');
  });
  it('mata', () => {
    assert(book.getMetaFromName('cover') === 'cover-image');
  });
  it('manifest', () => {
    const cover = book.getManifestItemFromId('cover');
    assert(cover.href = 'cover.html');
    assert(cover['media-type'] === 'application/xhtml+xml');
  });
});
