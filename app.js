var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const indexRoute = require('./routes/index')
const booksRoute = require('./routes/books')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/static",  express.static(path.join(__dirname, "/public")));


app.use('/', indexRoute);
app.use('/books', booksRoute)

app.use( (req, res, next) => {
    next(createError(404));
});
  
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  
  if (err.status === 404) {
    console.log("404");
    res.render("404");
  } else {
    res.status(err.status || 500);
    res.render("error");
  }
});


module.exports = app;
