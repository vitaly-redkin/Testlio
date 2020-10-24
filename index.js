'use strict';

const Koa = require('koa');
const app = new Koa();
const router = require('./lib/routes');
const PORT = 8080;

app.use(require('koa-bodyparser')());
app.use(async (ctx, next) => {
  // the parsed body will store in ctx.request.body
  // if nothing was parsed, body will be an empty object {}
  ctx.body = ctx.request.body;
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

// Syncing ORM models structure with the database
const sequelize = require('./lib/models/connection');
console.log("Syncing models...");
sequelize.sync();
console.log("All models were synchronized successfully.");

app.listen(PORT);
console.log('Listening on http://localhost:%s/', PORT);
