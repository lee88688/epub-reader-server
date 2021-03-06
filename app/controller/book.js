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
    const { category } = ctx.request.query;
    const searchData = { user: session.user._id };
    if (category) {
      const user = await model.User.findOne({ _id: session.user._id });
      const books = user.categories.get(category);
      if (Array.isArray(books)) {
        searchData._id = { $in: books };
      }
    }
    const res = await model.Book.find(searchData).select('-content -user -__v');
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
    const user = await model.User.findOne({ _id: session.user._id });
    for (const key of user.categories.keys()) {
      user.categories.set(key, [ ...user.categories.get(key).filter(id => ctx.params.id !== id) ]);
    }
    await user.save();
    await fs.promises.unlink(helper.asarFileDir(book.fileName));
    await model.Mark.deleteMany({ book: mongoose.Types.ObjectId(ctx.params.id) }); // remove book's mark
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
  async tableOfContents() {
    // todo: Authentication for fileName and user
    const { ctx } = this;
    const { service, helper, model } = ctx;
    const { fileName } = ctx.params;
    const book = await model.Book.findOne({ fileName });
    const { href } = book.getTocPath();
    const buffer = await service.file.readAsarFile(helper.asarFileDir(fileName), href);
    const toc = await service.epub.parseToc(buffer.toString('utf8'));
    ctx.body = helper.createSuccessResp(toc);
  }
  async getBookCurrent() {
    const { ctx } = this;
    const { helper, model, app: { mongoose } } = ctx;
    const { id } = ctx.params;
    const book = await model.Book.findOne({ _id: mongoose.Types.ObjectId(id) });
    if (!book) {
      ctx.body = helper.createFailResp('book is not found!');
      return;
    }
    ctx.body = helper.createSuccessResp(book.current);
  }
  async updateBookCurrent() {
    const { ctx } = this;
    const { helper, model, app: { mongoose } } = ctx;
    const { id } = ctx.params;
    const { current } = ctx.request.body;
    const currentReg = /epubcfi\(.*?\)/;
    if (!currentReg.test(current)) {
      ctx.body = helper.createFailResp('illegal epubcfi!');
      return;
    }
    const book = await model.Book.findOne({ _id: mongoose.Types.ObjectId(id) });
    if (!book) {
      ctx.body = helper.createFailResp('book is not found!');
      return;
    }
    book.current = current;
    await book.save();
    ctx.body = helper.createSuccessResp();
  }
}

module.exports = BookController;
