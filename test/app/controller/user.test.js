'use strict';

const Mock = require('mockjs');
const { app, assert, mock } = require('egg-mock/bootstrap');
const { mockNewUser } = require('../../lib');

describe('test/app/controller/user.test.js', () => {
  const mockUser = mockNewUser();

  before(async () => {
    const User = app.mongoose.model('User');
    const user = new User(mockUser);
    await user.save();
  });

  it('login', async () => {
    // const ctx = app.mockContext({});
    app.mockCsrf();
    await app.httpRequest()
      .post('/api/user/login')
      .send(mockUser);
    // console.log(res);
  });

  it('category', async () => {
    const categoryName = Mock.Random.word();
    const ctx = app.mockContext();
    const { model } = ctx;
    const sessionUser = await model.User.findOne({ email: mockUser.email }).select('-categories');
    app.mockSession({ user: sessionUser });

    // add category
    await app.httpRequest()
      .post('/api/category')
      .send({ name: categoryName })
      .expect(200);
    const res = await app.httpRequest()
      .get('/api/category')
      .expect(200);
    const { data } = res.body;
    assert(data && data.length && data[0] === categoryName);

    // add books
    const getCategoryBooks = async name => {
      const user = await model.User.findOne({ email: mockUser.email }).select('categories');
      return user.categories.get(name);
    };

    const { data: books } = Mock.mock({ 'data|3': [ '@id' ] });
    await app.httpRequest()
      .post('/api/category/add-books')
      .send({ name: categoryName, books })
      .expect(200);
    let booksInDb = await getCategoryBooks(categoryName);
    assert.deepStrictEqual([ ...booksInDb ], books);

    // remove books
    await app.httpRequest()
      .post('/api/category/remove-books')
      .send({ name: categoryName, books })
      .expect(200);
    booksInDb = await getCategoryBooks(categoryName);
    assert(booksInDb.length === 0);

    // rename category
    const newName = Mock.Random.word();
    await app.httpRequest()
      .post('/api/category/rename')
      .send({ oldName: categoryName, newName })
      .expect(200);
    const resRename = await app.httpRequest()
      .get('/api/category')
      .expect(200);
    const { data: dataRename } = resRename.body;
    assert(dataRename && dataRename.length && dataRename[0] === newName);

    // delete
    await app.httpRequest()
      .post('/api/category/delete')
      .send({ name: newName })
      .expect(200);
    const resDelete = await app.httpRequest()
      .get('/api/category')
      .expect(200);
    const { data: dataDelete } = resDelete.body;
    assert(dataDelete && dataDelete.length === 0);
  });

  after(async () => {
    await app.mongoose.model('User').deleteOne({ email: mockUser.email });
    mock.restore();
  });
});
