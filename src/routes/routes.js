const express = require('express');

// Require controllers
const controller = require('../controllers/AppController');
const isUserLogged = require('../middleware/isUserLogged');

const router = express.Router();

router.get('/', controller.getIndex);

router.get('/shop', controller.getShop);

router.get('/category/:categoryId', controller.getCategory);

router.get('/product/:productId', controller.getProduct);

router.get('/cart', isUserLogged, controller.getCart);

router.get('/checkout', isUserLogged, controller.getCheckout);

router.post('/add-cart', isUserLogged, controller.postAddCard);

router.post('/complete-checkout', isUserLogged, controller.postCompleteCheckout);

router.post('/3ds-code', isUserLogged, controller.post3DSCode);

router.post('/cart-delete-item', isUserLogged, controller.postCartDeleteItem);

module.exports = router;