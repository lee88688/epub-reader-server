'use strict';

const fs = require('fs');
const path = require('path');

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const indexPath = path.resolve(this.config.baseDir, 'public/index.html');
    ctx.body = fs.createReadStream(indexPath);
    ctx.set('content-type', 'text/html');
    // ctx.redirect('/public/index.html');
  }
}

module.exports = HomeController;
