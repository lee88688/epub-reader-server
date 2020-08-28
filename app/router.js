'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // user
  router.post('/api/user/login', controller.user.login);
  router.post('/api/user/logout', controller.user.logout);
  // router.resources('book', '/api/book', controller.book);
  router.post('/api/book', controller.book.create);
};
