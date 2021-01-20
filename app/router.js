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
  // category
  router.resources('category', '/api/category', controller.category);
  router.post('/api/category/rename', controller.category.rename);
  router.post('/api/category/delete', controller.category.deleteCategory);
  router.post('/api/category/add-books', controller.category.addBooks);
  router.post('/api/category/remove-books', controller.category.removeBooks);
  // book
  router.resources('book', '/api/book', controller.book);
  router.get('/api/book/toc/:fileName', controller.book.tableOfContents);
  router.get(/^\/book-file\/([\w-]+)\/(.*)$/, controller.book.bookFile);
  router.post('/api/book/current/:id', controller.book.updateBookCurrent);
  router.get('/api/book/current/:id', controller.book.getBookCurrent);
  // mark
  router.resources('mark', '/api/mark/:book', controller.mark);
  // todo: when not start with /api will redirect to /public/index.html or /
  router.get(/.*/, controller.home.index);
};
