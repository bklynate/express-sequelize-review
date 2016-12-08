const Sequelize = require('sequelize');

// This is how we connect from Node to our Sequelize database. We should create only 1 instance for our database.
// The string we send in the initialization consists of 'protocol://dbAddress:dbPort/dbName'
// If we were NOT on localhost we would also need username and password
// Make sure that you have a database already created with your `dbName`, because this does NOT create a database
const db = new Sequelize('postgres://localhost:5432/practice', { 
    logging: false //this option means that every SQL query will NOT be logged. If you want to see each query remove this option (or make it `true`)
});

// Defining a Sequelize model
// `Train` is a variable in JS that literally equals a Sequelize model.
// 'train' the string (first parameter) is the name of the table that will be created in Postgres
const Train = db.define('train', {
    // This is an attribute (column) that will be created in Postgres
    name: {
        // For a list of possible data types see -- http://docs.sequelizejs.com/en/v3/docs/models-definition/#data-types
        type: Sequelize.STRING, 
        // SQL validation
        allowNull: false,
        // Sequelize custom validations -- http://docs.sequelizejs.com/en/v3/docs/models-definition/#validations
        validate: {
            notEmpty: true
        }
    },
    type: Sequelize.STRING
}, {
    getterMethods: {
        // This creates a virtual attribute, meaning that in Postgres we will not have a column with this name, but every query will return a table that contains this column (fullName).
        // This attribute will not exist in the database but will be given to us when we query
        // http://docs.sequelizejs.com/en/v3/docs/models-definition/#getters-setters
            // Note: if you write a getter on a single attribute (like mutating a tags array to a tag string) you will use `.getDataValue()`
        fullName: function () {
            // You ** must ** return from this function to create the virtual attribute
            return `${this.name} the ${this.type}` ;
        },
    },
    hooks: {
        // `this` is the model (Train) for hooks
        // The three parameters hooks take (http://docs.sequelizejs.com/en/v3/docs/hooks/)
        beforeDestroy: function (trainInstance) {
            return Car.destroy({where: {trainId: trainInstance.id}})
        }
    }
});

const Car = db.define('car', {
    name: Sequelize.STRING,
    color: Sequelize.STRING,
}, {
    classMethods: {
        // `this` is the model (Car) for class methods
        findByColor: function (color) {
            // returning a promise means that when we call this function it will be `thenable`  (e.g. `Car.findByColor(red).then(arrayOfCars => { /* so much good code */ }`)  
            return this.findAll({
                // Here we are filtering our query so that we only get colors that match the one being sent in -- http://docs.sequelizejs.com/en/v3/docs/querying/#where
                where: { color: color }
            });
        }
    },
    instanceMethods: {
        // `this` is the instance (car) for instance methods; instance meaning a single row in the Car table
        findSimilar: function () {
            // model methods include query methods like `findAll` and `findById` -- http://docs.sequelizejs.com/en/v3/api/model/
            return Car.findAll({
                where: {
                    id: {
                        // Intermediate queries use operators and combinations
                        // http://docs.sequelizejs.com/en/v3/docs/querying/#operators, 
                        // http://docs.sequelizejs.com/en/v3/docs/querying/#combinations
                        $ne: this.id
                    },
                    color: this.color
                }
            });
        }
    },
    // this is a property that will be the scope for every query to this table -- more about scope http://docs.sequelizejs.com/en/latest/docs/scopes/
    defaultScope: {
        // include means to populate the foreignKey (which directly corresponds to another table's primary key) with the information from the foreign table (e.g. give me an entire train object rather than just a trainId)
        // http://docs.sequelizejs.com/en/v3/docs/models-usage/#eager-loading
        include: [Train]
        // Alternate include syntax
            // eager-load all associations without specifying them individually -- http://docs.sequelizejs.com/en/v3/docs/models-usage/#including-everything
                // include: [{all: true}]
            // eager-load assocations created with aliases
                // include: [{model: User, as: 'author'}]
    }
});

// This creates
    // methods on 'Train', such as '.addCar'. (http://docs.sequelizejs.com/en/v3/api/associations/has-many/)
    // a foreign key attribute on the Car table pointing the primary key attribute on the Train table
    // the ability to eager-load from the Train table
Train.hasMany(Car);
// This creates
    // methods on 'Car', such as '.setTrain'. These methods work on a car instance and take in a train instance or id (e.g. carInstance.setTrain(trainObject.id))
    // a foreign key attribute on the Car table pointing the primary key attribute on the Train table
    // the ability to eager-load from the Car table
Car.belongsTo(Train);

// Docs for these associations
// http://docs.sequelizejs.com/en/v3/docs/associations/#one-to-many-associations
// http://docs.sequelizejs.com/en/v3/docs/associations/#belongsto


// Whenever this file is required in somewhere else, it will send an object with the keys below
module.exports = {
    Train,
    Car,
    db
};
