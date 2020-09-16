'use strict';

const { Controller } = require('egg');
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const mime = require('mime-types');

class BookController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, helper, session } = ctx;
    const res = await model.Book.find({ user: session.user._id }).select('-content -user');
    ctx.body = helper.createSuccessResp(res);
  }
  async create() {
    // console.log('book create');
    const { ctx } = this;

    const fileSteam = await ctx.getFileStream();
    try {
      await ctx.service.file.saveEpubFile(fileSteam);
    } catch (e) {
      sendToWormhole(fileSteam);
      throw e;
    }
    // todo: deal with rimfaf errors. use individual service to remove folder.
    await new Promise(resolve => {
      const { filename } = fileSteam;
      rimraf(path.join(ctx.app.config.tempDir, filename), resolve);
    });
    ctx.body = ctx.helper.createSuccessResp(null);
  }
  async destroy() {
    const { ctx } = this;
    const { model, helper, session, app: { mongoose } } = ctx;
    const book = await model.Book.findOne({ _id: mongoose.Types.ObjectId(ctx.params.id), user: session.user._id });
    if (!book) {
      ctx.body = helper.createFailResp('book id is not found.');
      return;
    }
    await fs.promises.unlink(helper.asarFileDir(book.fileName));
    await model.Book.deleteOne({ _id: mongoose.Types.ObjectId(ctx.params.id) });
    ctx.body = helper.createSuccessResp(null);
  }
  async bookFile() {
    const { ctx } = this;
    const fileName = ctx.params[0];
    const filePath = ctx.params[1];
    const file = await ctx.service.file.readAsarFile(ctx.helper.asarFileDir(fileName), filePath);
    const contentType = mime.lookup(filePath);
    if (contentType) {
      ctx.set('Content-Type', contentType);
    }
    ctx.set('Cache-Control', 'max-age=60');
    ctx.body = file;
  }
}

module.exports = BookController;
