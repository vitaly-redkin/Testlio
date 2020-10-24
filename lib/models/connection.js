'use strict';
const config = require('../../config/mysql.json');
const Sequelize = require('sequelize');

module.exports = new Sequelize(
    config.DATABASE,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: 'mysql',
        pool: {
            max: 10,
            min: 0
        }
    }
);
