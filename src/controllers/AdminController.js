const bcrypt = require('bcryptjs');

const config = require('../../config');
const Admin = require('../model/Admin');
const Category = require('../model/Category');
const Product = require('../model/Product');


// get / post admin logins

exports.getLogin = (req, res, next) => {
    Admin.countDocuments({}).then(isAvailable => {
        if (isAvailable === 0) {
            bcrypt
                .hash(config.adminPassword, 12)
                .then(hashedPassword => {
                    const admin = new Admin({
                        username: config.adminUsername,
                        password: hashedPassword
                    });
                    return admin.save();
                })
                .then(result => {
                    res.redirect('/adminstrator/login');
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        } else {
            res.render('../src/views/admin/auth/login', {
                pageTitle: 'Admin Panel - Login',
                path: '/secondary'
            })
        }
    })
    res.render('../src/views/admin/auth/login', {
        pageTitle: 'Admin Panel - Login',
        path: '/secondary'
    })
}

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    Admin.findOne({ username: username }).then(admin => {
        bcrypt.compare(password, admin.password).then(doMatch => {
            if (doMatch) {
                req.session.isAdminLoggedIn = true;
                req.session.admin = admin;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/adminstrator/categories');
                });
            }
            return res.status(422).render('../src/views/admin/auth/login', {
                pageTitle: 'Kitter - Sign in',
                path: '/secondary',
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/adminstrator/login');
        });
    })
}

// admin panel

exports.getCategories = (req, res, next) => {
    Category.find().then(categories => {
        res.render('../src/views/admin/categories', {
            pageTitle: 'Admin Panel - Categories',
            categories: categories
        })
    })
}

exports.getProducts = (req, res, next) => {
    Product.find().then(products => {
        res.render('../src/views/admin/categories', {
            pageTitle: 'Admin Panel - Categories',
            products: products
        })
    })
}

exports.getAddCategory = (req, res, next) => {
    res.render('../src/views/admin/add-category', {
        pageTitle: 'Admin - Add Category'
    })
}

exports.getAddProduct = (req, res, next) => {
    Category.find().then(categories => {
        res.render('../src/views/admin/add-product', {
            pageTitle: 'Admin - Add Product',
            categories: categories
        })
    })
}

exports.getProducts = (req, res, next) => {
    Product.find().then(products => {
        res.render('../src/views/admin/products', {
            pageTitle: 'Admin Panel - Products',
            products: products
        })
    })
}

exports.postNewCategory = (req, res, next) => {
    const name = req.body.name;
    const image = req.body.image;

    const category = new Category({
        name: name,
        imageUrl: image
    })

    category.save().then(result => {
        res.redirect('back');
    })
}

exports.postNewProduct = (req, res, next) => {
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const rate = req.body.rate;
    const frontImg = req.body.frontImg;
    const backImg = req.body.backImg;
    const categoryId = req.body.category;

    const product = new Product({
        name: name,
        price: price,
        description: description,
        rate: rate,
        frontImg: frontImg,
        backImg: backImg,
        categoryId: categoryId
    })

    product.save().then(result => {
        res.redirect('back');
    })
}

exports.postDeleteCategory = (req, res, next) => {
    const categoryId = req.body.categoryId;

    Category.findByIdAndDelete(categoryId).then(result => {
        Product.deleteMany({categoryId: categoryId}).then(result => {
            res.redirect('back')
        })
    })
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    Product.findByIdAndDelete(productId).then(result => {
        res.redirect('back')
    })
}

exports.postAdminLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}