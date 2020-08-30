'use strict';

const { Controller } = require('egg');
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');

class BookController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, helper, session } = ctx;
    const res = await model.Book.find({ user: session.user._id }).exec();
    ctx.body = helper.createSuccessResp(res);
  }
  async create() {
    console.log('book create');
    const { ctx } = this;

    const fileSteam = await ctx.getFileStream();
    try {
      await ctx.service.file.saveEpubFile(fileSteam);
    } catch (e) {
      sendToWormhole(fileSteam);
      throw e;
    }
    // todo: add removing temporary folder
    ctx.body = ctx.helper.createSuccessResp(null);
  }
  async destroy() {
    const { ctx } = this;
    const { model, helper, app: { mongoose } } = ctx;
    const book = await model.Book.findOne({ _id: mongoose.Types.ObjectId(ctx.params.id) });
    await fs.promises.unlink(helper.asarFileDir(book.fileName));
    await model.Book.deleteOne({ _id: mongoose.Types.ObjectId(ctx.params.id) });
    ctx.body = helper.createSuccessResp(null);
  }
}

module.exports = BookController;
