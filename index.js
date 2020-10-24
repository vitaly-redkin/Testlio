'use strict';

const Koa = require('koa');
const app = new Koa();
const router = require('./lib/routes');
const PORT = 8080;

app.use(require('koa-bodyparser')());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT);
console.log('Listening on http://localhost:%s/', PORT);
