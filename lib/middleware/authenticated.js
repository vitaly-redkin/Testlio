/**
 * Very simple authetication middleware.
 */
const jwt = require('jsonwebtoken');

const Auth = require('../api/auth');

module.exports = async (ctx, next) => {
  if (!ctx.headers.authorization) {
    ctx.throw(403, 'No token.');
  }

  const token = ctx.headers.authorization.split(' ')[1];

  try {
    const jwtPayload = jwt.verify(token, Auth.secret);
    ctx.userName = jwtPayload.name;
  } catch (err) {
    ctx.throw(err.status || 403, err.text);
  }

  await next();
};