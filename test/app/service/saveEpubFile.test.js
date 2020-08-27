'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const Mock = require('mockjs');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

describe('save epub file service test', () => {
  const fileName = 'sample1';
  const mockUser = Mock.mock({
    name: '@name',
    email: '@email',
    password: '@id',
  });

  it('create user', async () => {
    const ctx = app.mockContext();
    const { model } = ctx;
    const user = new model.User(mockUser);
    await user.save();
    assert(user._id);
  });

  it('saveEpubFile', async () => {
    const user = await app.mongoose.model('User').findOne({ email: mockUser.email });
    assert(user);
    const ctx = app.mockContext({ session: { user } });
    const epubDir = path.join(app.config.baseDir, 'test/assets/sample1.epub');
    const fileStream = fs.createReadStream(epubDir);
    fileStream.fileName = fileName;
    const book = await ctx.service.file.saveEpubFile(fileStream);
    assert(book.user === user._id); // fixme: whether to use toString function to compare
    assert(fs.existsSync(ctx.helper.asarFileDir(book.fileName)));
  });

  after(async () => {
    // delete user and book
    const ctx = app.mockContext();
    const { model, helper } = ctx;
    const user = model.User.findOne({ email: mockUser.email });
    const book = model.Book.findOne({ user: user._id });
    await new Promise(resolve => {
      const outputDir = path.join(app.config.tempDir, fileName);
      rimraf(outputDir, resolve);
    });
    await new Promise(resolve => {
      rimraf(helper.asarFileDir(book.fileName), resolve);
    });
    await model.Book.deleteOne({ _id: book._id });
    await model.User.deleteOne({ _id: user._id });
  });
});
