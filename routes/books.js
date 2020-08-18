const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

// GET all books 
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [["title", "ASC"]]});
  res.render("books/index", { books, title: "List of Books" });
}));

// Get test 500 error
router.get('/error', (req, res, next) => {
  const err = new Error();
  err.message = 'Custom 500 error thrown';
  err.status = 500;
  throw err;
});

// GET /books/new Shows the create new book form. 
router.get('/new', asyncHandler(async (req, res) => {
  res.render("books/new-book", { book: {}, title: "New Book"});
}));

// POST /books/new Posts a new book to the database. 
router.post('/new', asyncHandler(async (req, res) => {
  try {
  const book = await Book.create(req.body);
  res.redirect("/");
  }
  catch (error) {
    if (error.name == "SequelizeValidationError") {
      const errors = error.errors;
      res.render("books/update-error", { book: {}, errors } );
    }
  }
}));

// GET /books/:id Shows book detail form.
router.get('/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("books/update-book", { book: book, title: book.title});
  }
  else {
    const err = new Error();
    err.status = 404;
    err.message = "It seems like you're looking for a book that doesn't exist...";
    res.render('books/page-not-found', {status: err.status, message: err.message})
  }
}));

// POST /books/:id Updates book info in the database.
router.post('/:id', asyncHandler(async (req, res) => {  
  try {
    const book = await Book.findByPk(req.params.id);
    let newBook = {};
    newBook.title = req.body.title;
    newBook.author = req.body.author;
    newBook.genre = req.body.genre;
    newBook.year = req.body.year;
    await book.update(newBook);
    res.redirect("/");
  }
  catch (error) {
    if (error.name == "SequelizeValidationError") {
      const errors = error.errors;
      const book = await Book.findByPk(req.params.id);
      res.render("books/update-error", { book, errors } );
    }
  }
}));

// POST /books/id/delete Deletes a book.
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect("/");
}));



module.exports = router;