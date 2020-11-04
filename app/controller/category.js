'use strict';

const Controller = require('egg').Controller;
const { Types: { ObjectId } } = require('mongoose');

class CategoryController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, session, helper } = ctx;
    const user = await model.User.findOne({ _id: ObjectId(session.user._id) }).select('categories');
    if (user.categories) {
      ctx.body = helper.createSuccessResp([ ...user.categories.keys() ]);
      return;
    }
    ctx.body = helper.createSuccessResp([]);
  }
  async create() {
    const { ctx } = this;
    const { model, session, helper } = ctx;
    const { name } = ctx.request.body;
    const user = await model.User.findOne({ _id: ObjectId(session.user._id) }).select('categories');
    if (user.categories.get(name)) {
      ctx.body = helper.createFailResp("can't create category with same name!");
      return;
    }
    user.categories.set(name, []);
    await user.save();
    ctx.body = helper.createSuccessResp();
  }
  async rename() {
    const { ctx } = this;
    const { model, session, helper } = ctx;
    const { oldName, newName } = ctx.request.body;
    const user = await model.User.findOne({ _id: ObjectId(session.user._id) }).select('categories');
    const value = user.categories.get(oldName);
    if (!value) {
      ctx.body = helper.createFailResp("can't find old category name!");
      return;
    }
    user.categories.delete(oldName);
    user.categories.set(newName, value);
    await user.save();
    ctx.body = helper.createSuccessResp();
  }
  async deleteCategory() {
    const { ctx } = this;
    const { model, session, helper } = ctx;
    const { name } = ctx.request.body;
    const user = await model.User.findOne({ _id: ObjectId(session.user._id) }).select('categories');
    user.categories.delete(name);
    await user.save();
    ctx.body = helper.createSuccessResp();
  }

  async addBooks() {
    const { ctx } = this;
    const { model, session, helper } = ctx;
    const { books, name } = ctx.request.body;
    const user = await model.User.findOne({ _id: ObjectId(session.user._id) }).select('categories');
    const oldBooks = user.categories.get(name);
    user.categories.set(name, [ ...new Set([ ...oldBooks, ...books ]) ]);
    await user.save();
    ctx.body = helper.createSuccessResp();
  }
  async removeBooks() {
    const { ctx } = this;
    const { model, session, helper } = ctx;
    const { books, name } = ctx.request.body;
    const user = await model.User.findOne({ _id: ObjectId(session.user._id) }).select('categories');
    const oldBooks = user.categories.get(name);
    const removeBookSet = new Set(books);
    user.categories.set(name, oldBooks.filter(b => !removeBookSet.has(b)));
    await user.save();
    ctx.body = helper.createSuccessResp();
  }
}

module.exports = CategoryController;
