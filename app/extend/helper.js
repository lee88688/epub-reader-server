'use strict';

const path = require('path');

module.exports = {
  createSuccessResp(data, msg) {
    return { data, msg, code: 0 };
  },
  createFailResp(msg, code = 1) {
    return { code, msg, data: null };
  },
  asarFileDir(name) {
    const { app } = this;
    return path.join(app.config.asarDir, `${name}.asar`);
  },
};
