/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1596614592243_9433';

  // add your middleware config here
  config.middleware = [];

  // add file extension
  config.multipart = {
    fileExtensions: [ '.epub' ], // 增加对 epub 扩展名的文件支持
  };

  config.static = {
    dir: path.join(appInfo.baseDir, 'public'),
  };

  config.security = {
    csrf: {
      // todo: deal with csrf
      ignore(ctx) {
        return ctx.request.url.startsWith('/api/user/login');
      },
    },
  };

  // add your user config here
  const userConfig = {
    tempDir: path.join(appInfo.root, 'temp'),
    asarDir: process.env.ASAR_DIR || path.join(appInfo.root, 'asar'),
  };

  return {
    ...config,
    ...userConfig,
  };
};
