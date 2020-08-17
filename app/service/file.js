'use strict';

const { Service } = require('egg');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const unzip = require('unzip');
const fstream = require('fstream');
const asar = require('asar');
const { fsGetter, EasyAsar } = require('asar-async');

class FileService extends Service {
  async convertEpubToAsar(fileStream, destFileName) {
    const { app } = this.ctx;
    const outputDir = path.join(app.config.tempDir, fileStream.fileName || 'epub');
    if (!fs.existsSync(outputDir)) {
      await mkdirp(outputDir);
    }
    const writeStream = fstream.Writer(outputDir);
    fileStream.pipe(unzip.Parse()).pipe(writeStream);
    await new Promise((resolve, reject) => {
      fileStream.on('end', resolve);
      fileStream.on('error', reject);
    });
    const asarDest = path.join(app.config.asarDir, `${destFileName}.asar`);
    if (!fs.existsSync(app.config.asarDir)) {
      await mkdirp(app.config.asarDir);
    }
    await asar.createPackage(outputDir, asarDest);
  }

  async readAsarFile(asarFile, filePath) {
    const ar = new EasyAsar(fsGetter(asarFile));
    await ar.fetchIndex();
    const buffer = await ar.readFile(filePath);
    return buffer;
  }
}

module.exports = FileService;
