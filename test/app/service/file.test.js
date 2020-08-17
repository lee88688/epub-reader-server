'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const fs = require('fs');
const path = require('path');
// const xml2js = require('xml2js');

describe('file service test', () => {
  const fileName = 'sample1';

  it('convert epub to asar', async () => {
    const ctx = app.mockContext();
    const epubDir = path.join(app.config.baseDir, 'test/assets/sample1.epub');
    const readStream = fs.createReadStream(epubDir);
    await ctx.service.file.convertEpubToAsar(readStream, fileName);
    const asarDir = path.join(app.config.asarDir, `${fileName}.asar`);
    assert(fs.existsSync(asarDir));
  });

  // it('read asar content file', async () => {
  //   const ctx = app.mockContext();
  //   const asarDir = path.join(app.config.asarDir, `${fileName}.asar`);
  //   const buffer = await ctx.service.file.readAsarFile(asarDir, 'META-INF/container.xml');
  //   const xmlObj = await xml2js.parseStringPromise(buffer.toString('utf8'));
  //   assert(xmlObj.container.rootfiles[0].rootfile[0].$['full-path'] === 'content.opf');
  // });
});
