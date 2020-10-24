'use strict';

const respond = require('./responses');
const Issue = require('../models/issue');

const baseUrl = 'http://localhost:8080';

const Issues = {};

/**
 * May be it is better to return 404 status if issue is not found?
 */
Issues.get = async (context) => {
  const issue = await Issue.findById(context.params.id);
  respond.success(context, { issue });
};

/**
 * Handler for the "add a new issue" end point.
 */
Issues.post = async (context) => {
  const title = context.body.title;
  const description = context.body.description;

  if (title && description) {
    const issue = await Issue.create({
      title,
      description,
    });
    // We do need to return the current state of the issue in DB
    // In the real life we may return only SOME properties of the created issue - but always an ID
    respond.success(context, {issue});
  } else {
    respond.badRequest(context, 'Both title and description should be provided for an issue')
  }
};

/**
 * Handler for the "update an existing issue" end point.
 * In the real life a partial update may NOT be allowed.
 */
Issues.put = async (context) => {
  const id = context.params.id;
  const title = context.body.title;
  const description = context.body.description;

  if (id && (title || description)) {
    let patch = {};
    if (title) patch.title = title;
    if (description) patch.description = description;
    await Issue.update(
      patch, {
       where: {
        id
      }
    });
    const issue = await Issue.findById(id);
    // We do need to return the current state of the issue in DB
    // In the real life we may return only SOME properties of the updated issue - but always an ID
    respond.success(context, {issue});
  } else {
    respond.badRequest(context, 'Both ID and either itle or description should be provided for an issue')
  }
};

/**
 * Handler for the "get issue list" end point.
 * 
 * In the real  life it should support some kind of paging
 * (page number and size to be suplies as query params)
 * and the return value better to be something like:
 * {
 *  issues: <Arra with issues>,
 *  totalCount: <total issue count>,
 *  pageNo: <current page number>,
 * }
 */
Issues.getList = async (context) => {
  const issues = await Issue.findAll();
  respond.success(context, {issues});
};

module.exports = Issues;
