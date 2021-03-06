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
    // set contentPath, manifest item href is relative to content.opf
    book.contentPath = 'OEBPS/content.opf';
    const data = await fs.promises.readFile(path.join(app.config.baseDir, 'test/assets/content.opf'));
    const content = await xml2js.parseStringPromise(data.toString('utf8'));
    book.content = JSON.stringify(content);
  });

  it('metadata', () => {
    // eslint-disable-next-line no-script-url
    assert(book.getMetadataFromKey('title') === 'JavaScript: The Good Parts');
    assert(book.getMetadataFromKey('publisher') === 'Yahoo Press');
  });

  it('cover', () => {
    assert(book.getMetaFromName('cover') === 'cover-image');
  });

  it('manifest', () => {
    const cover = book.getManifestItemFromId('cover');
    assert(cover.href = 'cover.html');
    assert(cover['media-type'] === 'application/xhtml+xml');
  });

  it('get toc href', () => {
    const { href } = book.getTocPath();
    assert(href === 'OEBPS/toc.ncx');
  });

  it('getManifestItemHrefUrl', () => {
    assert(book.getManifestItemHrefUrl('cover.html') === 'OEBPS/cover.html');
  });
});
