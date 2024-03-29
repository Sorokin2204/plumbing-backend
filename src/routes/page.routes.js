const Router = require('express');
const pageController = require('../controller/page.controller');

const router = new Router();
const auth = require('../middleware/auth');
const { errorWrapper } = require('../middleware/customError');

router.post('/page/create', errorWrapper(pageController.createPage));
router.get('/page/forms', errorWrapper(pageController.getPageForms));
router.post('/send-form', errorWrapper(pageController.sendFormToEmail));
router.get('/page/list', errorWrapper(pageController.getPages));
router.get('/page/single', errorWrapper(pageController.getPageSingle));
router.post('/file/upload', errorWrapper(pageController.uploadFile));
router.post('/page/delete', errorWrapper(pageController.deletePage));
router.post('/login', errorWrapper(pageController.login));
router.get('/verify', errorWrapper(pageController.verify));
router.get('/search', errorWrapper(pageController.searchPages));
router.post('/payment', errorWrapper(pageController.createPayment));
router.get('/service-list', errorWrapper(pageController.getServiceList));

module.exports = router;
