'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const rimraf = require('rimraf');
const xml2js = require('xml2js');

describe('file service test', () => {
  const fileName = 'sample1';
  let asarDir = '';

  before(() => {
    asarDir = path.join(app.config.asarDir, `${fileName}.asar`);
  });

  it('convert epub to asar', async () => {
    const ctx = app.mockContext();
    const epubDir = path.join(app.config.baseDir, 'test/assets/sample1.epub');
    const readStream = fs.createReadStream(epubDir);
    readStream.filename = fileName;
    await ctx.service.file.convertEpubToAsar(readStream, fileName);
    assert(fs.existsSync(asarDir));
  });

  it("compare directory structure and files' size", async () => {
    const ctx = app.mockContext();
    const index = await ctx.service.file.readAsarIndex(asarDir);
    // console.log(JSON.stringify(index));
    const topDir = path.join(app.config.tempDir, fileName);
    const queue = [[ topDir, index ]];
    let next;
    // eslint-disable-next-line no-cond-assign
    while ((next = queue.shift())) {
      const [ dir, idx ] = next;
      const dirList = await fsPromises.readdir(dir);
      if (dirList.length !== Object.keys(idx.files).length) throw new Error(`path(${dir}) is not the same as asar`);
      await Promise.all(dirList.map(async d => {
        const currentPath = path.join(dir, d);
        if (!idx.files[d]) throw new Error(`path(${currentPath}) is not in asar`);
        if ('files' in idx.files[d]) {
          // current d is a directory
          queue.push([ currentPath, idx.files[d] ]);
          return;
        }
        const stat = await fsPromises.stat(currentPath);
        if (stat.size !== idx.files[d].size) {
          // file size is not the same as asar.
          throw new Error(`file(${currentPath}) size is not the same in asar. file(${stat.size}) vs asar(${idx.files[d].size})`);
        }
      }));
    }
  });

  it('read asar content file', async () => {
    // todo: add file content compare
    const ctx = app.mockContext();
    const buffer = await ctx.service.file.readAsarFile(asarDir, 'META-INF/container.xml');
    const xmlObj = await xml2js.parseStringPromise(buffer.toString('utf8'));
    assert(xmlObj.container.rootfiles[0].rootfile[0].$['full-path'] === 'content.opf');
    await ctx.service.file.readAsarFile(asarDir, 'toc.ncx');
    await ctx.service.file.readAsarFile(asarDir, 'OEBPS/cover.xml');
  });

  after(async () => {
    await new Promise(resolve => {
      const outputDir = path.join(app.config.tempDir, fileName);
      rimraf(outputDir, resolve);
    });
    await new Promise(resolve => {
      rimraf(asarDir, resolve);
    });
  });
});
