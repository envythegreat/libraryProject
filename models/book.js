'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Book extends Sequelize.Model {}
    Book.init({
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please Provide A Title',
                },
                notEmpty:{
                    msg: 'Title is required'
                },
            },
        },
        author: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Please Provide a author',
                },
                notEmpty: {
                    msg: 'Author is required',
                },
            },
        },
        genre: Sequelize.STRING,
        year: Sequelize.INTEGER,
    }, {sequelize});
    return Book
}