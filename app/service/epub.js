'use strict';

const Service = require('egg').Service;
const xml2js = require('xml2js');

function parseNavPoint(point) {
  const item = {
    label: '',
    src: '',
  };
  const { navLabel, content, navPoint } = point;
  item.label = navLabel.map(label => {
    const { text } = label;
    return text.map(t => (t._ ? t._ : t)).join(', ');
  }).join(', ');
  item.src = content[0].$.src;
  if (navPoint) {
    item.children = navPoint.map(parseNavPoint);
  }
  return item;
}

class EpubService extends Service {
  async parseNcx(ncxString) {
    if (!ncxString) return;
    const { ncx } = await xml2js.parseStringPromise(ncxString);
    // parse navMap and navList, currently, only parse navMap
    const navMap = ncx.navMap[0];
    const toc = navMap.navPoint.map(parseNavPoint);
    return toc;
  }
  async parseToc(tocString) {
    // todo: suport epub3 Navigation Document
    const { ctx: { service } } = this;
    return service.epub.parseNcx(tocString);
  }
}

module.exports = EpubService;
