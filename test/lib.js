'use strict';

const Mock = require('mockjs');

function mockNewUser(number = 1) {
  const users = Mock.mock({
    [`data|${number}`]: [{
      name: '@name',
      email: '@email',
      password: '@id',
    }],
  });
  return users.data;
}

module.exports = { mockNewUser };
