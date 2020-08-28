const express = require('express');
const router = express.Router();
const { Book } = require('../models/index').models;
const book = require('../models/book');
const Sequelize = require('sequelize');
const { sequelize } = require('../models');

/***************************
 * ASYNC HANDLER FUNCTION
 ****************************/
function asyncHandler(cb) {
    return async(req, res, next) => {
        try {
            await cb(req, res, next)
        } catch (error) {
            next(error);
        }
    }
};

/***************************
 * ERROR HANDLER
 ****************************/
const errorHandler = router.get('/error', (req, res, next) => {
    const err = new Error();
    err.message = 'Custom 500 error thrown';
    err.status = 500;
    res.render('error');
    throw err;
});

/*********************
 * SETS UP SERVER
 **********************/
//GET MAIN PAGE
router.get('/', asyncHandler(async(req, res, next) => {
    res.redirect('/books/page/1');
}));

//GET NEW BOOK 
router.get('/new', asyncHandler(async(req, res) => {
    res.render('new-book', { book: {}, title: "New Book" });
}));

//POST NEW BOOK 
router.post('/new', asyncHandler(async(req, res) => {
    let book;

    try {
        book = await Book.create({
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            year: req.body.year
        });
        res.redirect('/');
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors;
            const messages = errors.map(err => err.message);

            book = await Book.build(req.body);
            res.render('new-book', { book, title: "New Book", validationErrors: messages });
        } else {
            throw error;
        }
    }
}));

//SEARCH FEATURE
router.post('/search', asyncHandler(async(req, res) => {
    const search = req.body.search;
    if (search) {
        const books = []
        let notAllBooksFound;
        let results;

        //SQL query for search
        [results] = await sequelize.query(
            `SELECT * FROM books WHERE title LIKE "%${search}%" 
        OR author LIKE "%${search}%" 
        OR genre LIKE "%${search}%";`
        );
        results.map(book => books.push(book));

        //year search
        if (!isNaN(search)) {
            [results] = await sequelize.query(`SELECT * FROM books WHERE year = ${search}`);
            results.map(book => books.push(book));
        }

        if (books.length === 0) {
            return res.render('none-found')
        }

        //to use later for including show all books button
        if (books.length !== (await Book.findAll()).length) notAllBooksFound = true;
        res.render('index', { books, title: "Books", notAllBooksFound });
    } else {
        res.redirect('/');
    }
}));

//GET PAGE ROUTE
router.get('/page', asyncHandler(async(req, res) => {
    res.redirect('/');
}));

//GET PAGE LIMIT/ PAGINATION SECTION
router.get('/page/:page', asyncHandler(async(req, res, next) => {
    const page = req.params.page;
    const limit = 12;
    const numberOfPages = Math.ceil((await Book.count()) / limit)

    // if page value is valid
    if (!isNaN(page) && page >= 1 && page <= numberOfPages) {
        let pagesIndexes = [];
        const offset = (page - 1) * limit;
        const books = await Book.findAll({
            limit,
            offset,
            order: [
                ['createdAt', 'DESC']
            ],
        });

        //if pages more than 0
        if (books.length > 0) {
            for (let i = 0; i < numberOfPages; i++) {
                pagesIndexes.push(i + 1);
            }
            return res.render('index', { books, pagesIndexes, title: "Books" });
        } else {
            return res.render('none-found');
        }

    } else {
        res.status(404);
        res.render('page-not-found');
    }
}));

//GET BOOK FORM
router.get('/:id', asyncHandler(async(req, res) => {
    const book = await Book.findByPk(req.params.id);

    //shows book details when clicked
    if (book) {
        const title = book.title;
        res.render('update-book', { book, title });
    } else {
        errorHandler(err, req, res, next);
    }
}));

//POST UPDATE BOOK 
router.post('/:id', asyncHandler(async(req, res) => {
    let book;
    book = await Book.findByPk(req.params.id);

    if (book) {

        try {
            await book.update(req.body);
            res.redirect('/');
        } catch (error) {

            if (error.name === 'SequelizeValidationError') {
                const errors = error.errors;
                const errorMsg = errors.map(error => error.message);
                res.render('update-book', { book, validationErrors: errorMsg });
            } else {
                throw error;
            }
        }
    } else {
        errorHandler(error, req, res, next);
    }
}));


//POST DELETE BOOK
router.post('/:id/delete', asyncHandler(async(req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (book) {
        book.destroy();
        res.redirect('/');
    } else {
        errorHandler(error, req, res, next);
    }
}));

module.exports = router;
