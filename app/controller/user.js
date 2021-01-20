'use strict';

const { Controller } = require('egg');

class UserController extends Controller {
  async login() {
    const { ctx } = this;
    const { model } = ctx;
    const { email, password } = ctx.request.body;
    const res = await model.User.findOne({ email, password }).select('-categories');
    if (!res) {
      ctx.body = ctx.helper.createFailResp('email or password does not exits.');
      return;
    }
    ctx.session.user = res;
    ctx.rotateCsrfSecret(); // refresh csrf token
    ctx.body = ctx.helper.createSuccessResp(null);
  }
  async logout() {
    const { ctx } = this;
    ctx.session = null;
    ctx.body = ctx.helper.createSuccessResp(null);
  }
  // crud api
  async index() {
    const { ctx } = this;
    const { model } = ctx;
    const { currentPage, pageSize } = ctx.query;
    const res = await model.User.find()
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);
    const total = model.User.estimatedDocumentCount();
    ctx.body = ctx.helper.createSuccessResp({ data: res, total });
  }
  async create() {
    const { ctx } = this;
    const { model } = ctx;
    const user = new model.User(ctx.request.body);
    await user.save();
    ctx.body = ctx.helper.createSuccessResp(user._id);
  }
}

module.exports = UserController;
