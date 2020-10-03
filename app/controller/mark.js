'use strict';

const Controller = require('egg').Controller;
const _ = require('lodash');

class MarkController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, helper, app: { mongoose } } = ctx;
    const { book } = ctx.params;
    const { type } = ctx.request.query;
    const queryObj = { book: new mongoose.Types.ObjectId(book) };
    if (type) {
      queryObj.type = type;
    }
    const marks = await model.Mark.find(queryObj);
    ctx.body = helper.createSuccessResp(marks || []);
  }
  async create() {
    const { ctx } = this;
    const { model, helper, app: { mongoose } } = ctx;
    const { book } = ctx.params;
    const { epubcfi } = ctx.request.body;
    if (!epubcfi) {
      ctx.body = helper.createFailResp("epubcfi can't be empty.");
      return;
    }
    const mark = new model.Mark({ ...ctx.request.body, book: new mongoose.Types.ObjectId(book) });
    await mark.save();
    ctx.body = helper.createSuccessResp(mark._id.toString());
  }
  async update() {
    const { ctx } = this;
    const { model, helper, app: { mongoose } } = ctx;
    const { type, epubcfi, content, color, selectedString } = ctx.request.body;
    const updateData = _.omitBy(
      { type, epubcfi, content, color, selectedString }, v => typeof v === 'undefined'
    );
    const { id, book } = ctx.params;
    await model.Mark
      .where({ _id: new mongoose.Types.ObjectId(id), book: new mongoose.Types.ObjectId(book) })
      .updateOne(updateData);
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
