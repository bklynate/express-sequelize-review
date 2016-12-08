const express = require('express');

// We are making a router - “mini-application” capable of performing middleware and routing functions
// http://expressjs.com/en/4x/api.html#router
const router = express.Router();

// This file is our overview of our routes. It helps keep things clean and organized, giving us a space to route neatly (read: for human readability)

// We are mounting middleware functions (the routers exported from `trains` and `cars`) when the base of the request path matches our specified path
// Note that the request path no longer includes `/api` after it was mounted in `app.js`
// http://expressjs.com/en/4x/api.html#app.use
router.use('/trains', require('./trains'))
router.use('/cars', require('./cars'))


// When this file is required into another file it will send `router`, including all attached methods
module.exports = router;