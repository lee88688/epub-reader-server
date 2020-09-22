'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

class MarkController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, helper, app: { mongoose } } = ctx;
    const { book } = ctx.params;
    const marks = await model.Mark.find({ book: mongoose.Types.ObjectId(book) });
    ctx.body = helper.createSuccessResp(marks || []);
  }
  async create() {
    const { ctx } = this;
    const { model, helper } = ctx;
    const { book } = ctx.params;
    const mark = new model.Mark({ ...ctx.request.body, book });
    await mark.save();
    ctx.body = helper.createSuccessResp(mark._id.toString());
  }
  async update() {
    const { ctx } = this;
    const { model, helper } = ctx;
    const { type, epubcfi, content } = ctx.request.body;
    const updateData = _.omitBy({ type, epubcfi, content }, v => !v);
    const { id } = ctx.params;
    await model.Mark.where({ _id: id }).update(updateData);
    ctx.body = helper.createSuccessResp();
  }
  async destroy() {
    const { ctx } = this;
    const { model, helper } = ctx;
    const { id } = ctx.params;
    const { deletedCount } = await model.Mark.deleteOne({ _id: id });
    if (deletedCount === 1) {
      ctx.body = helper.createSuccessResp();
    } else {
      ctx.body = helper.createFailResp('delete failed');
    }
  }
}

module.exports = MarkController;
