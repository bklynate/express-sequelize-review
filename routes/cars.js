const express = require('express');
const router = express.Router();

const { Car } = require('../models');

router.get('/', function (req, res, next) {
    // this query will be eagerly loading Trains because of the `defaultScope` in `../models/index.js`
    Car.findAll({
        where: req.query
    })
        .then(allCarsArray => res.send(allCarsArray))
        .catch(next);
});

// route parameters are variables and noted as such by the preceding `:` -- http://expressjs.com/en/4x/api.html#req.param
router.get('/color/:color', function (req, res, next) {
    // Here we are use a custom class method
    Car.findByColor(req.params.color)
        .then(arrayOfCars => res.send(arrayOfCars))
        // We do NOT want to catch errors and log them in our `/models/index.js` file because we still need to send a response, and we log the errors in our error handling middleware anyways
        // Use catch here to call `next` rather than in your custom class method in `/models/index.js`
        .catch(next);
})

function makeError (status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

router.param('carId', function(req, res, next, id) {
    Car.findById(id)
        .then(foundCar => {
            if (!foundCar) throw makeError(404, 'No car matched that ID');
            req.car = foundCar;
            next();
        })
        .catch(next)
})

router.get('/:carId', function (req, res, next) {
    res.send(req.car);
});

router.put('/:carId', function (req, res, next) {
    req.car.update()
        .then(updatedCar => res.send(updatedCar))
        .catch(next);
})

router.delete('/:carId', function (req, res, next) {
    req.car.destroy()
        .then(() => res.sendStatus(204))
        .catch(next);
})

router.post('/', function(req, res, next) {
    Car.create(req.body)
        .then(createdCar => res.status(201).send(createdCar))
        .catch(next);
})

module.exports = router;
