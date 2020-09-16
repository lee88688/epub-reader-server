'use strict';

const { Service } = require('egg');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const unzipper = require('unzipper');
const asar = require('asar');
const { fsGetter, EasyAsar } = require('asar-async');
const { index: asarIndexSymbol } = require('asar-async/dist/base');
const { v1: uuidv1 } = require('uuid');
const xml2js = require('xml2js');

class FileService extends Service {
  async convertEpubToAsar(fileStream, destFileName) {
    const { app } = this.ctx;
    const outputDir = path.join(app.config.tempDir, fileStream.filename || 'epub');
    if (!fs.existsSync(outputDir)) {
      await mkdirp(outputDir);
    }

    const writeProcess = [];
    await fileStream
      .pipe(unzipper.Parse({ verbose: false }))
      .on('entry', entry => {
        const { type, path: fileName } = entry;
        if (type === 'Directory') {
          writeProcess.push(mkdirp(path.join(outputDir, fileName)));
        } else {
          writeProcess.push(new Promise(async (resolve, reject) => {
            const fileNameDir = path.join(outputDir, fileName);
            const parentDir = path.dirname(fileNameDir);
            // make sure the parent dir exists
            if (!fs.existsSync(parentDir)) {
              await mkdirp(parentDir);
            }
            entry
              .pipe(fs.createWriteStream(fileNameDir))
              .on('close', resolve)
              .on('error', reject);
          }));
        }
      })
      .promise();
    await Promise.all(writeProcess);

    // waiting in async iterater body may lost unzip data
    // const entryProcess = fileStream
    //   .pipe(unzipper.Parse({ verbose: false, forceStream: true }));
    // for await (const entry of entryProcess) {
    //   const { type, path: fileName } = entry;
    //   console.log(fileName);
    //   if (type === 'Directory') {
    //     writeProcess.push(mkdirp(path.join(outputDir, fileName)));
    //   } else {
    //     writeProcess.push(new Promise((resolve, reject) => {
    //       entry
    //         .pipe(fs.createWriteStream(path.join(outputDir, fileName)))
    //         .on('close', resolve)
    //         .on('error', reject);
    //     }));
    //   }
    // }
    // await Promise.all(writeProcess);

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

  async readAsarIndex(asarFile) {
    const ar = new EasyAsar(fsGetter(asarFile));
    await ar.fetchIndex();
    return ar[asarIndexSymbol];
  }

  async saveEpubFile(fileStream) {
    const { ctx } = this;
    const { model, service, helper, session } = ctx;
    const bookFileName = uuidv1();
    await service.file.convertEpubToAsar(fileStream, bookFileName);
    const container = await service.file.readAsarFile(helper.asarFileDir(bookFileName), 'META-INF/container.xml');
    const xmlObj = await xml2js.parseStringPromise(container.toString('utf8'));
    const contentPath = xmlObj.container.rootfiles[0].rootfile[0].$['full-path'];
    const contentBuffer = await service.file.readAsarFile(helper.asarFileDir(bookFileName), contentPath);
    const content = await xml2js.parseStringPromise(contentBuffer.toString('utf8'));
    const book = new model.Book({
      fileName: bookFileName,
      user: session.user._id,
      contentPath,
      content: JSON.stringify(content),
    });
    book.fillInBaseInfo();
    await book.save();
    return book;
  }
}

module.exports = FileService;
