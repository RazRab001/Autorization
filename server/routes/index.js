const userController = require('../controllers/userController')
const Router = require('express');
const router = new Router();
const {body} = require('express-validator')
const authMiddleware = require('../middleWare/auth-middleware')

router.post('/reg',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getAll);

module.exports = router;