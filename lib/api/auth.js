'use strict';

const jwt = require('jsonwebtoken');

const respond = require('./responses');

const Auth = {};

Auth.secret = process.env.JWT_SECRET || 'testlio_coding_day';

/**
 * Creates JWT access token by the name from the query.
 */
Auth.get = async (context) => {
  const name = context.params.name;
  const payload = { name };
  const secret = Auth.secret;
  const token = jwt.sign(payload, secret);
  respond.success(context, { token });
};

module.exports = Auth;
