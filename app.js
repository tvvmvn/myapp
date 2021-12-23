var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var mongoose = require('mongoose')
var session = require('express-session')
var MongoStore = require('connect-mongo')
var { User } = require('./models/model')
var mongo_url = 'mongodb://localhost:27017/local_myapp'

var populatedb = require('./models/populatedb.js')


// Connect MongoDB
mongoose.connect(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Save session data in the database
const sessionMiddleware = session({
  secret: 'Keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: mongo_url
  })
})
app.use(sessionMiddleware)
app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  if (req.session.user) {
    var user = await User.findById(req.session.user)
    res.locals.user_global = { id: user._id, username: user.username }
  } 
  next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
