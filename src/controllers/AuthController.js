// packages
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// models
const User = require('../model/User');

exports.getLogin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('../src/views/auth/login', {
        path: '/login',
        pageTitle: 'Kitter - Sign in',
        errorMessage: message,
        path: '/secondary',
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.getRegister = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }

    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('../src/views/auth/register', {
        path: '/signup',
        pageTitle: 'Kitter - Sign up',
        errorMessage: message,
        path: '/secondary',
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    });
}


// post

exports.postLogin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }

    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('../src/views/auth/login', {
            pageTitle: 'Kitter - Sign in',
            path: '/secondary',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('../src/views/auth/login', {
                    pageTitle: 'Kitter - Sign in',
                    path: '/secondary',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
            bcrypt.compare(password, user.password).then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('../src/views/auth/login', {
                        pageTitle: 'Kitter - Sign in',
                        path: '/secondary',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                }).catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postRegister = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }

    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('../src/views/auth/register', {
            path: '/secondary',
            pageTitle: 'Kitter - Sign up',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            // return transporter.sendMail({
            //   to: email,
            //   from: 'shop@node-complete.com',
            //   subject: 'Signup succeeded!',
            //   html: '<h1>You successfully signed up!</h1>'
            // });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}