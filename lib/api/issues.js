'use strict';

const { QueryTypes, Op } = require('sequelize');

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
  const issue = await Issue.findByPk(context.params.id);
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
    await sequelize.transaction(async (t) => {
      const issue = await Issue.create(patch, {transaction: t});

      const revision = await generateIssueRevision(issue.id, patch, t, true);
      await IssueRevision.create(revision, {transaction: t});

      // We do need to return the current state of the issue in DB
      // In the real life we may return only SOME properties of the created issue - but always an ID
      respond.success(context, {issue});
    });
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

    await sequelize.transaction(async (t) => {
      const revision = await generateIssueRevision(id, patch, t);
      if (revision) {
        await IssueRevision.create(
          revision,
          { transaction: t });
      }

      await Issue.update(
        patch, {
          where: {
            id
          }, 
          transaction: t,
       });
      const issue = await Issue.findByPk(id, { transaction: t });
      // We do need to return the current state of the issue in DB
      // In the real life we may return only SOME properties of the updated issue - but always an ID
      respond.success(context, {issue});
    });
  } else {
    respond.badRequest(context, 'Both ID and either itle or description should be provided for an issue')
  }
};

/**
 * Handler for the "get issue list" end point.
 * 
 * In the real  life it should support some kind of paging
 * (orderring, page number and size to be suplied as query params)
 * and the return value better to be something like:
 * {
 *  issues: <Arra with issues>,
 *  totalCount: <total issue count>,
 *  pageNo: <current page number>,
 * }
 */
Issues.getList = async (context) => {
  const issues = await Issue.findAll({order: ['id']});
  respond.success(context, {issues});
};

/**
 * Handler for the "compare issue revisions" end point.
 */
Issues.getComparison = async (context) => {
  const id = context.params.id;
  const revA = context.params.revA;
  const revB = context.params.revB;

  const issue = await Issue.findByPk(id);
  if (!issue) {
    respond.notFound(context);
  }

  const history = await IssueRevision.findAll({
    where: {
      issue_id: id, 
      id: { [Op.gte]: revA } 
    },
    order: ['revision_no']
  });

  const issueB = rollbackIssueToRevision(issue, history, revB);
  const issueA = rollbackIssueToRevision(issueB, history, revA);

  const changes = {};
  Object.keys(issueA).forEach(f => {
    if (issueA[f] !== issueB[f]) {
      changes[f] = {
        before: issueA[f],
        after: issueB[f],
      }
    }
  });

  const revisions = history
    .filter(r => r.id >= revA && r.id <= revB)
    .map(r => ({
      id: r.id,
      revision_no: r.revision_no,
      changes: r.changes,
      updated_by: r.updated_by,
      updated_at: r.updated_at,
    }));

  respond.success(context, {
    issue: {
      before: issueA,
      after: issueB,
    }, 
    changes,
    revisions,
  });
};

/**
 * Rollbacks an issue to the state it had in the given revision.
 * 
 * @param issue issue as it exists now
 * @param history array with issue revisions
 * @param revisionId id of the revision to restore
 */
function rollbackIssueToRevision(issue, history, revisionId) {
  console.log(issue);
  const currentIssue = {
    title: issue.title,
    description: issue.description,
  };
  const origIssue = {...currentIssue};

  const historyPart = history.filter(r => r.id >= revisionId);
  historyPart
    .slice(1, historyPart.length)
    .reverse().forEach(r => {
      Object.keys(r.changes).forEach(p => {
        origIssue[p] = r.changes[p].before;
      });
    });

  return origIssue;
}

/**
 * Generates a revision object to be added to the history.
 * 
 * @param id ID of the issue
 * @param patch patch object (only updated properties)
 * @param t transacton to use
 * @param isNewIssue true if this issue is a new one
 */
async function generateIssueRevision(id, patch, t, isNewIssue = false) {
  const issue = (isNewIssue ? null : await Issue.findByPk(id, { transaction: t }));
  const changes = getChanges(issue, patch);

  if (changes) {
    let maxRevisionNo = 0;
    if (!isNewIssue) {
      maxRevisionNo = await IssueRevision.max(
        'revision_no', { 
          where: { issue_id: id },
          transaction: t,
        });
      maxRevisionNo = (maxRevisionNo ?? 0);
    }
 
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

  return (Object.keys(changes).length ? changes : null);
};

module.exports = Issues;
