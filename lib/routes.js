'use strict';

const Router = require('koa-router');
const router = new Router();

const authenticated = require('./middleware/authenticated');

router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));
router.get('/auth/:name', require('./api/auth').get);
router.get('/issues/:id', require('./api/issues').get);
router.post('/issues', authenticated, require('./api/issues').post);
router.put('/issues/:id', authenticated, require('./api/issues').put);
router.get('/issues', require('./api/issues').getList);
router.get('/issues/:id/compare/:revA/:revB', require('./api/issues').getComparison)

module.exports = router;
