'use strict';

const { app, assert, mock } = require('egg-mock/bootstrap');
const fs = require('fs');
const path = require('path');
const { mockNewUser } = require('../../lib');

describe('app/controller/book.test.js', async () => {
  const mockUser = mockNewUser();

  before(async () => {
    const ctx = app.mockContext();
    const { model } = ctx;
    const user = new model.User(mockUser);
    await user.save();
  });

  beforeEach(async () => {
    const { mongoose } = app;
    const user = await mongoose.model('User').findOne({ email: mockUser.email });
    app.mockSession({ user });
  });

  it('upload a epub file', async () => {
    const fileName = 'sample1.epub';
    app.mockCsrf();
    const fileDir = path.join(app.baseDir, `test/assets/${fileName}`);
    await app.httpRequest()
      .post('/api/book')
      .type('form')
      .attach(fileName, fileDir)
      .expect(200);
    const ctx = app.mockContext();
    const { model, session, helper } = ctx;
    const book = await model.Book.findOne({ user: session.user._id });
    assert(book);
    assert(fs.existsSync(helper.asarFileDir(book.fileName)));
  });

  it('remove book', async () => {
    const ctx = app.mockContext();
    const { model, session, helper } = ctx;
    const book = await model.Book.findOne({ user: session.user._id });
    app.mockCsrf();
    await app.httpRequest()
      .delete(`/api/book/${book._id}`)
      .expect(200);
    assert(!fs.existsSync(helper.asarFileDir(book.fileName)));
    const delBook = await model.Book.findOne({ user: session.user._id });
    assert(!delBook);
  });

  after(async () => {
    const ctx = app.mockContext();
    const { model } = ctx;
    await model.User.deleteOne({ email: mockUser.email });
    mock.restore();
  });
});