const express = require('express');
const { check, body } = require('express-validator');
const User = require('../model/User');

// Require controllers
const controller = require('../controllers/AuthController');

const router = express.Router();

router.get('/login', controller.getLogin);

router.get('/register', controller.getRegister);

router.post('/auth',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    controller.postLogin);

router.post('/signup',
    [
        check('email').isEmail().withMessage('Please enter a valid email.').custom((value, { req }) => {
            // if (value === 'test@test.com') {
            //   throw new Error('This email address if forbidden.');
            // }
            // return true;
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject(
                        'E-Mail exists already, please pick a different one.'
                    );
                }
            });
        }).normalizeEmail(),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters.').isLength({ min: 5 }).isAlphanumeric().trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match!');
                }
                return true;
            })
    ],
    controller.postRegister);

router.post('/logout', controller.postLogout);

module.exports = router;