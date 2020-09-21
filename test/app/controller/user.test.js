'use strict';

const { app } = require('egg-mock/bootstrap');
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

  after(async () => {
    await app.mongoose.model('User').deleteOne({ email: mockUser.email });
  });
});
