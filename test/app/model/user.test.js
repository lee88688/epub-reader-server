'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const { mockNewUser } = require('../../lib');

describe('test/model/user.test.js', () => {
  const mockUser = mockNewUser();

  after(async () => {
    const ctx = app.mockContext();
    const { model: { User } } = ctx;
    await User.deleteOne({ name: mockUser.name });
  });

  it('create user', async () => {
    const ctx = app.mockContext();
    const { model: { User } } = ctx;
    const user = new User(mockUser);
    await user.save();
    assert(user.name === mockUser.name);
    assert(user._id);
  });
});
