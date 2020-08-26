'use strict';

const { Controller } = require('egg');

class BookController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, helper, session } = ctx;
    const res = await model.Book.find({ user: session.user._id }).exec();
    ctx.body = helper.createSuccessResp(res);
  }
  async create() {
    const { ctx } = this;
    const { model, helper, session } = ctx;
  }
}

module.exports = BookController;
