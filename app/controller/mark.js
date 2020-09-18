'use strict';

const Controller = require('egg').Controller;

class MarkController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, helper, app: { mongoose } } = ctx;
    const { book } = ctx.query;
    const marks = await model.Mark.find({ book: mongoose.Types.ObjectId(book) });
    ctx.body = helper.createSuccessResp(marks || []);
  }
}

module.exports = MarkController;
