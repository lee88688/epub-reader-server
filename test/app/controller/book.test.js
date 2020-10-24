'use strict';

const { app, assert, mock } = require('egg-mock/bootstrap');
const fs = require('fs');
const path = require('path');
const Mock = require('mockjs');
const { mockNewUser } = require('../../lib');

describe('app/controller/book.test.js', async () => {
  const mockUser = mockNewUser();
  let bookBak = null;

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
    bookBak = book;
  });

  it('get all book', async () => {
    const res = await app.httpRequest()
      .get('/api/book')
      .expect(200);
      // .expect({});
    assert(res.body.code === 0);
    const books = res.body.data;
    assert(books.length === 1);
    const book = books[0];
    assert(book._id === bookBak._id.toString());
    assert(book.fileName === bookBak.fileName);
  });

  it('get toc of book', async () => {
    const res = await app.httpRequest()
      .get(`/api/book/toc/${bookBak.fileName}`)
      .expect(200);
    assert(res.body.code === 0);
    const data = res.body.data;
    assert(data.length === 3);
    assert(data[0].label === 'Contents');
    assert(data[0].src === 'OEBPS/GeographyofBli_body_split_000.html#contents_1');
  });

  it('get the books of the category', async () => {
    const categoryName = Mock.Random.word();
    const categoryCname = Mock.Random.cword(3);
    const { mongoose } = app;
    const user = await mongoose.model('User').findOne({ email: mockUser.email });
    const books = [ bookBak._id.toString() ];
    user.categories.set(categoryName, books);
    user.categories.set(categoryCname, books);
    await user.save();
    const res1 = await app.httpRequest()
      .get('/api/book')
      .query({ category: categoryName })
      .expect(200);
    const actual1 = res1.body.data.map(({ _id }) => _id);
    assert.deepStrictEqual(actual1, books);
    // with other name
    const res2 = await app.httpRequest()
      .get('/api/book')
      .query({ category: categoryCname })
      .expect(200);
    const actual2 = res2.body.data.map(({ _id }) => _id);
    assert.deepStrictEqual(actual2, books);
  });

  it('remove book', async () => {
    const ctx = app.mockContext();
    const { model, session, helper } = ctx;
    const book = await model.Book.findOne({ user: session.user._id });
    const mark = new model.Mark({ type: 'highlight', epubcfi: Mock.Random.id(), book: book._id });
    await mark.save();
    app.mockCsrf();
    await app.httpRequest()
      .delete(`/api/book/${book._id}`)
      .expect(200);
    assert(!fs.existsSync(helper.asarFileDir(book.fileName)));
    const delBook = await model.Book.findOne({ user: session.user._id });
    assert(!delBook);
    // removing book will remove its marks
    assert(mark.epubcfi);
    const m = await model.Mark.findOne({ epubcfi: mark.epubcfi });
    assert(!m);
  });

  after(async () => {
    const ctx = app.mockContext();
    const { model } = ctx;
    await model.User.deleteOne({ email: mockUser.email });
    mock.restore();
  });
});
