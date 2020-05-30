const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

// Handler function to warp each route.
function asyncHandler(callback) {
    return async(req, res, next) => {
        try{
            await callback(req, res, next)
        } catch (error) {
            res.send(500)
        }
    }
}

// redirect to books route
router.get('/', asyncHandler( async(req, res) => {
    const books =  await Book.findAll({
        order:[["createdAt", "DESC"]]
    })
    res.render('index', {books});
}));

router.get('/new', (req, res) => {
    res.render('/newBook');
});

router.post('/new', asyncHandler( async(req, res) => {
    let book;
    try {
        book = await Book.create(req.body);
        res.redirect('/');
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            // console.log(error.errors.message)
            res.render("/newBook", {errors: error.errors});
        } else {
            throw error;
        }
    }
    
}));

/* Get individual book. */
router.get('/:id', asyncHandler( async(req, res) => {
    // console.log(req.params.id)
    const book =  await Book.findByPk(req.params.id);
    if (book){
        res.render('bookDetail', {book});
    } else {
        res.sendStatus(404);
    }
}));

router.post('/:id/', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id)
    // console.log(req.body)
    if(book) {
        await book.update(req.body);
        res.redirect('/');
    } else {
        res.sendStatus(404);
    }
}))


/* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        await book.destroy();
        res.redirect('/')
    } else {
        res.sendStatus(404);
    }
}));

module.exports = router;

