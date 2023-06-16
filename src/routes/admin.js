const express = require('express');

// Require controllers
const controller = require('../controllers/AdminController');
const isAdminLogged = require('../middleware/isAdminLogged');

const router = express.Router();

router.get('/login', controller.getLogin);

router.get('/categories', isAdminLogged, controller.getCategories);

router.get('/products', isAdminLogged, controller.getProducts);

router.get('/add-category', isAdminLogged, controller.getAddCategory);

router.get('/add-product', isAdminLogged, controller.getAddProduct);

router.post('/auth', controller.postLogin);

router.post('/post-category', isAdminLogged, controller.postNewCategory);

router.post('/post-product', isAdminLogged, controller.postNewProduct);

router.post('/delete-category', isAdminLogged, controller.postDeleteCategory);

router.post('/delete-product', isAdminLogged, controller.postDeleteProduct);

module.exports = router;