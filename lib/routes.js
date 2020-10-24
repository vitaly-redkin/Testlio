'use strict';

const Router = require('koa-router');
const router = new Router();

router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));
router.get('/issues/:id', require('./api/issues').get);
router.post('/issues', require('./api/issues').post);
router.put('/issues/:id', require('./api/issues').put);
router.get('/issues', require('./api/issues').getList);


module.exports = router;
