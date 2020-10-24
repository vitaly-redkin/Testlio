'use strict';

const { QueryTypes } = require('sequelize');
const sequelize = require('../models/connection');

const respond = require('./responses');
const Issue = require('../models/issue');
const IssueRevision = require('../models/issueRevision');

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
    const patch = {
      title,
      description,
    };
    const issue = await Issue.create(patch);

    const revision = await generateIssueRevision(issue.id, patch, true);
    await IssueRevision.create(revision);

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
    const patch = {};
    if (title) patch.title = title;
    if (description) patch.description = description;

    const revision = await generateIssueRevision(id, patch);
    await IssueRevision.create(revision);

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

/**
 * Generates a revision object to be added to the history.
 * 
 * @param id ID of the issue
 * @param patch patch object (only updated properties)
 * @param isNewIssue true if this issue is a new one
 */
async function generateIssueRevision(id, patch, isNewIssue = false) {
  const issue = (isNewIssue ? null : await Issue.findById(id));
  const changes = getChanges(issue, patch);

  let maxRevisionNo = 0;
  if (!isNewIssue) {
    const r = await sequelize.query(
      `SELECT COALESCE(MAX(revision_no), 0) AS revision_no
        FROM issue_revisions
        WHERE issue_id = :issueId
      `, { 
        replacements: { issueId: id },
        type: QueryTypes.SELECT,
      });
    maxRevisionNo = r[0].revision_no;
  }

  if (changes !== {}) {
    return {
      issue_id: id,
      revision_no: maxRevisionNo + 1,
      changes : changes,
    }
  } else {
    return null;
  }
}

/**
 * Generates changs object to save as a revision.
 * 
 * @param issue old issue state
 * @param patch patch object (only updated properties)
 * @returns an object that describes the revision changes:
 * {
 *   title: {
 *     before: '...',
 *     after: '...',
 *   },
 *   description: {
 *     before: '...',
 *     after: '...',
 *   }
 * }
 */
function getChanges(issue, patch) {
  const fields = ['title', 'description'];
  const changes = {};
  fields.forEach(f => {
    if (
      patch[f] !== undefined && (
        !issue || patch[f] !== issue[f]
      )
     ) {
      changes[f] = {
        before: (issue ? issue[f] : undefined),
        after: patch[f],
      };
    }
  });

  return changes;
};

module.exports = Issues;
