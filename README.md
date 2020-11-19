# epub-reader

background service of [reader app](https://github.com/lee88688/epub-reader-app)

## docker image

To build docker image, it need download [reader app](https://github.com/lee88688/epub-reader-app) release(epub-reader-app.zip) and extract to root/public directory and build.

when run docker image, you need give `MONGO_DB` env for mongodb uri, and mount folder to `/opt/asar`.

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org
