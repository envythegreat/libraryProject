  
const express = require('express');
const router = express.Router();

/******************
 * GET HOME ROUTE
 ******************/
router.get('/', (req, res) => {
  res.redirect("/books"); 
});

module.exports = router;