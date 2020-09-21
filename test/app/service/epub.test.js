'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const fs = require('fs');
const path = require('path');

describe('test/app/service/epub', () => {
  it('parse ncx', async () => {
    const ctx = app.mockContext();
    const ncx = await fs.promises.readFile(path.join(app.config.baseDir, 'test/assets/toc.ncx'));
    const res = await ctx.service.epub.parseNcx(ncx.toString());
    assert(res.length === 2);
    assert(res[0].label === "AUTHOR'S NOTE");
    assert(res[0].src === 'OEBPS/Sway_body_split_002.html');
    const res1 = res[1];
    assert(res1.label = 'PART ONE');
    assert(res1.src === 'OEBPS/Sway_body_split_003.html');
    const children = res1.children;
    assert(children);
    assert(children.length === 1);
    assert(children[0].label === 'THE HOUSES, 1969');
    assert(children[0].src === 'OEBPS/Sway_body_split_004.html');
  });
});
