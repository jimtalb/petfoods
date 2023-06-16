// Require dependencies
const path = require('path');
const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
// const multer = require('multer');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// Require sources
const errController = require('./src/controllers/error');
const appRoutes = require('./src/routes/routes');
const adminRoutes = require('./src/routes/admin');
const authRoutes = require('./src/routes/auth');

// Require models
const User = require('./src/model/User');
const Admin = require('./src/model/Admin');

const MONGODB_URi = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.snioicq.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URi,
    collection: 'sessions'
});

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images');
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString() + '-' + file.originalname);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (
//         file.mimetype === 'image/png' ||
//         file.mimetype === 'image/jpg' ||
//         file.mimetype === 'image/jpeg'
//     ) {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

const port = 3000;

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//     multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

app.use((req, res, next) => {
    res.locals.isAdminAuthenticated = req.session.isAdminLoggedIn;
    next();
});

app.use((req, res, next) => {
    // throw new Error('Sync Dummy');
    if (!req.session.admin) {
        return next();
    }
    Admin.findById(req.session.admin._id)
        .then(admin => {
            if (!admin) {
                return next();
            }
            req.admin = admin;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});

app.use((req, res, next) => {
    // throw new Error('Sync Dummy');
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});

app.use('/adminstrator', adminRoutes);
app.use(appRoutes);
app.use(authRoutes);

app.get('/500', errController.get500);

app.use(errController.get404);

app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render('../src/views/500', {
      pageTitle: 'Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
  });

mongoose.connect(MONGODB_URi).then(connection => { app.listen(process.env.PORT || port); }).catch(err => console.log(err));