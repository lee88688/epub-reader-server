# epub-reader

this project is inspired by [Android APP Lithium](https://play.google.com/store/apps/details?id=com.faultexception.reader&hl=en_US&gl=US). Lithium is a very great reader app for offline epub book. this project with [reader app](https://github.com/lee88688/epub-reader-app) is a online reader service for epub book. all with books, marks and bookmarks is store on server.

current features:
- category
- marks with comments
- bookmarks
- display toc
- pc and mobile compatible 

feel free to give a new issue and pull requests.

## build docker image

To build docker image, it need download [reader app](https://github.com/lee88688/epub-reader-app) release(epub-reader-app.zip) and extract to root/public directory and build.

when run docker image, you need give `MONGO_DB` env for mongodb uri, and mount folder to `/opt/asar` for users' uploading books.

## QuickStart

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
