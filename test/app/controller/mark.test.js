'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const { mockNewUser } = require('../../lib');
const Mock = require('mockjs');
const _ = require('lodash');

describe('test/app/controller/mark.test.js', () => {
  let userId;
  let bookId;
  before(async () => {
    const mockUser = mockNewUser();
    const ctx = app.mockContext();
    const { model } = ctx;
    const user = new model.User(mockUser);
    await user.save();
    userId = user._id.toString();
    const book = new model.Book({ user: user._id });
    await book.save();
    bookId = book._id.toString();
  });

  after(async () => {
    const ObjectId = app.mongoose.Types.ObjectId;
    const ctx = app.mockContext();
    const { model } = ctx;
    await model.User.deleteOne({ _id: new ObjectId(userId) });
    await model.Book.deleteOne({ _id: new ObjectId(bookId) });
  });

  let mockMark;
  let markId;
  it('create a mark', async () => {
    mockMark = Mock.mock({
      type: 'highlight',
      epubcfi: 'epubcfi(@word)',
      book: bookId,
      content: '@sentence',
    });
    const res = await app.httpRequest()
      .post(`/api/mark/${bookId}`)
      .send(mockMark)
      .expect(200);
    const { data: id, code } = res.body;
    markId = id;
    assert(code === 0);
    const { model } = app.mockContext();
    const mark = await model.Mark.findOne({ _id: id });
    assert(mark.type === mockMark.type);
    assert(mark.epubcfi === mockMark.epubcfi);
    assert(mark.book.toString() === mockMark.book);
    assert(mark.content === mockMark.content);
  });

  it('get marks', async () => {
    const res = await app.httpRequest()
      .get(`/api/mark/${bookId}`)
      .expect(200);
    const { code, data } = res.body;
    assert(code === 0);
    assert(data.length === 1);
    const [ mark ] = data;
    const markRes = _.omit(mark, [ '_id', '__v' ]);
    assert.deepStrictEqual(markRes, mockMark);
  });

  it('update the mark', async () => {
    const newContent = Mock.Random.sentence();
    await app.httpRequest()
      .put(`/api/mark/${bookId}/${markId}`)
      .send({ content: newContent })
      .expect(200);
    const { model } = app.mockContext();
    const mark = await model.Mark.findOne({ _id: markId });
    assert(mark.type === mockMark.type);
    assert(mark.epubcfi === mockMark.epubcfi);
    assert(mark.book.toString() === mockMark.book);
    assert(mark.content === newContent);
  });

  it('delete the mark', async () => {
    await app.httpRequest()
      .delete(`/api/mark/${bookId}/${markId}`)
      .expect(200);
    const { model } = app.mockContext();
    const mark = await model.Mark.findOne({ _id: markId });
    assert(!mark);
  });
});
