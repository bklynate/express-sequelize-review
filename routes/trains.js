const express = require('express');
const router = express.Router();

// `require('../models')` is literally equivalent to the module.exports. In this case it is an object with 3 keys (Train, Car and db). 
    // We could also write const Train = require('../models').Train
const { Train } = require('../models');

// Remember that when we employ `app.use` with a route, the path moving forward is mutated (i.e. this one does not include `/api/trains` any longer)
// http://expressjs.com/en/4x/api.html#app.use
router.get('/', function (req, res, next) {

    // Train is a Sequelize model, so we can use model methods
    // model methods include `findAll` and `findById` -- http://docs.sequelizejs.com/en/v3/api/model/
    // `findAll` is asynchronous (a Promise), which means
    Train.findAll({
        // this syntax allows for no `req.query`, which would look like `where: {}`, meaning Sequelize will filter by nothing
        // this syntax also allows for there to be a `req.query` (e.g. '/api/trains?type=caboose' => req.query = {type: caboose}), meaning Sequelize will filter by the `req.query` object. (e.g. `where: {type: engine}`)
        where: req.query,
        // eager-load all associations without specifying them individually -- http://docs.sequelizejs.com/en/v3/docs/models-usage/#including-everything
        // for more on eager-loading see `../models/index.js`
        include: [{all: true}]
    })
        // We are sending one response and that is the array of trains we found from our database
        // `.send` is an express method on the response object. It interprets what it is given and sets the headers to json for objects, as well as sends a status of 200 by default
        .then(allTrainsArray => res.send(allTrainsArray))
        // we are catching our errors and calling `next` with them (i.e. `next(error)`) 
        .catch(next);

        // just calling `next()` will find the next middleware that is a verb/route match
        // calling `next(somethingSentIn)` will find the next error handling middleware
        // order matters in both of these cases
});

// A function to make my errors
function makeError (status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// router.param adds a callback that will be invoked when we go to a route with the corresponding parameter (`trainId` here)
// the first parameter (`trainId`) is the name of the route parameters (`:trainId`), the value associated with this is passed in as the 4th parameter of the callback function in router.param (`id` below)
// http://expressjs.com/en/4x/api.html#router.param
router.param('trainId', function(req, res, next, id) {
    Train.findById(id)
        .then(foundTrain => {
            // if there is no train throw an error
            if (!foundTrain) throw makeError(404, 'No train matched that ID');
            // if there is a train add it to the express request object so that it can be accessed in succeeding middleware functions
            req.train = foundTrain;
            // we HAVE to call next here so that we go into the next verb/route matching middleware function (order matters!)
            next();
        })
        .catch(next)
})

// getting a single train
router.get('/:trainId', function (req, res, next) {
    // we are able to send back the train that we added to the request object in router.param because it ran before this function
    res.send(req.train);
});

router.put('/:trainId', function (req, res, next) {
    // the train object we found in router.param is a Sequelize instance because it is a row we received back from our database query
    // here are Sequelize instance methods -- http://docs.sequelizejs.com/en/latest/api/instance/
    // `.update()` is an asynchronous (read: Promise) method that takes in the changes you want to make (think req.body - what the user sent as the body for a put will be the changes to make to this instance). 
    // we have access to req.body because of the use of `bodyParser` in `app.js` (order matters!)
    req.train.update()
        .then(updatedTrain => res.send(updatedTrain))
        .catch(next);
})

router.delete('/:trainId', function (req, res, next) {
    req.train.destroy()
        // `.sendStatus()` sends a response. If you want to change the status but not send a response use `.status()`
        // status 204 means success, no content (so no body should be added to the response if you use status 204)
        .then(() => res.sendStatus(204))
        .catch(next);
})

router.post('/', function(req, res, next) {
    console.log(req.body)
    // Remember `create()` is a model method, `build()` is a model method, and `save()` is an instance method
    Train.create(req.body)
        // status 201 is for created, so I expect to see that on all responses if you have created something (i.e. most post routes)
        .then(createdTrain => res.status(201).send(createdTrain))
        .catch(next);
})

// When this file is required into another file it will send `router`, including all attached methods
module.exports = router;
