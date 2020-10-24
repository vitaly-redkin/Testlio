'use strict';

const Sequelize = require('sequelize');
const sequelize = require('./connection');
const Issue = require('../models/issue');

const IssueRevision = sequelize.define('issue_revision', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  issue_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  revision_no: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  changes: {
    type: Sequelize.JSON,
    allowNull: false,
  },
  updated_by: {
    type: Sequelize.STRING,
    defaultValue: 'unknown'
  }
}, {
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  tableName: 'issue_revisions'
});

Issue.hasMany(IssueRevision, {
  foreignKey: 'issue_id'
});
IssueRevision.belongsTo(Issue, {
  foreignKey: 'issue_id'
});

module.exports = IssueRevision;