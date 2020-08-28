'use strict';

const { Controller } = require('egg');
const sendToWormhole = require('stream-wormhole');

class BookController extends Controller {
  async index() {
    const { ctx } = this;
    const { model, helper, session } = ctx;
    const res = await model.Book.find({ user: session.user._id }).exec();
    ctx.body = helper.createSuccessResp(res);
  }
  async create() {
    console.log('book create');
    const { ctx } = this;
    const parts = ctx.multipart();
    let part;
    while ((part = await parts()) != null) {
      if (part.length) {
        // 这是 busboy 的字段
        console.log('field: ' + part[0]);
        console.log('value: ' + part[1]);
        console.log('valueTruncated: ' + part[2]);
        console.log('fieldnameTruncated: ' + part[3]);
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          return;
        }
        // part 是上传的文件流
        console.log('field: ' + part.fieldname);
        console.log('filename: ' + part.filename);
        console.log('encoding: ' + part.encoding);
        console.log('mime: ' + part.mime);
        // 文件处理，上传到云存储等等
        let result;
        try {
          result = await ctx.oss.put('egg-multipart-test/' + part.filename, part);
        } catch (err) {
          // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
          await sendToWormhole(part);
          throw err;
        }
        console.log(result);
      }
    }
    // const fileSteam = await ctx.getFileStream();
    // try {
    //   ctx.service.saveEpubFile(fileSteam);
    // } catch (e) {
    //   sendToWormhole(fileSteam);
    //   throw e;
    // }
    // todo: add removing temporary folder
    ctx.body = ctx.helper.createSuccessResp(null);
  }
  async destroy() {
    const { ctx } = this;
    const { model, helper, app: { mongoose } } = ctx;
    await model.Book.deleteOne({ _id: mongoose.Types.ObjectId(ctx.params.id) });
    ctx.body = helper.createSuccessResp(null);
  }
}

module.exports = BookController;
