'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/model/user.test.js', () => {
  it('create user', async () => {
    const ctx = app.mockContext();
    const { model: { User } } = ctx;
    const name = 'luci';
    const user = new User({ name });
    await user.save();
    assert(user.name === name);
    assert(user._id);
    await User.deleteOne({ _id: user._id });
  });
});
