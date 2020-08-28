'use strict';

const Mock = require('mockjs');

function mockNewUser(number) {
  const users = Mock.mock({
    [`data|${number}`]: {
      name: '@name',
      email: '@emial',
      password: '@id',
    },
  });
  return users.data;
}

module.exports = { mockNewUser };
