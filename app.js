const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const books = require('./routes/books');
const { sequelize } = require('./models/');

//create port number
const port = process.env.PORT || 3000;

//create app variable
const app = express();


//set up static routes
app.use('/static', express.static('public'));

//set up view engine
app.set('view engine', 'pug');

//use body-parser
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use('/', routes);
app.use('/books', books);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error();
    err.status = 404;
    err.message = "- Sorry, this page does not exist"
    res.render('page-not-found');
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

//set up port listener and sync
sequelize.sync()
    .then(() => {
        app.listen(port, () => console.log('The application is running on port 3000!'));
    });

module.exports = app;