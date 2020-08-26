'use strict';

module.exports = {
  createSuccessResp(data, msg) {
    return { data, msg, code: 0 };
  },
  createFailResp(msg, code = 1) {
    return { code, msg, data: null };
  },
};
