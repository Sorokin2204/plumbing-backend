const Router = require('express');
const pageController = require('../controller/page.controller');

const router = new Router();
const auth = require('../middleware/auth');
const { errorWrapper } = require('../middleware/customError');

router.post('/page/create', errorWrapper(pageController.createPage));
router.get('/page/list', errorWrapper(pageController.getPages));
router.get('/page/single', errorWrapper(pageController.getPageSingle));
router.post('/file/upload', errorWrapper(pageController.uploadFile));
router.post('/page/delete', errorWrapper(pageController.deletePage));
router.post('/login', errorWrapper(pageController.login));
router.get('/verify', errorWrapper(pageController.verify));

module.exports = router;
