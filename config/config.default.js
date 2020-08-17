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

  // add your user config here
  const userConfig = {
    tempDir: path.join(appInfo.root, 'temp'),
    asarDir: path.join(appInfo.root, 'asar'),
  };

  return {
    ...config,
    ...userConfig,
  };
};
