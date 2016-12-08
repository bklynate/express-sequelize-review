const morgan = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');
const app = express(); //We are making an express application with this invokation - http://expressjs.com/en/4x/api.html#express
const { db } = require('./models')

module.exports = app;

//morgan is logging middleware - concise output colored by response status for development use. - https://github.com/expressjs/morgan
app.use(morgan('dev')); 

//We are statically serving files here. `index.html` is the only file we need to serve and that is in the route directory. Usually we will see a public folder as that is more secure. I just want to remind you what this line is even doing and where it looks - http://expressjs.com/en/4x/api.html#express.static
app.use(express.static(__dirname));

//bodyParser determines if there was a body on the HTTP request, and if there is one it parses it and adds `body` as a key to the express `request` object. 
//`body` equals a JS object 
// https://github.com/expressjs/body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', require('./routes'));


//This is error handling middleware because it has ** 4 parameters ** -- http://expressjs.com/en/guide/error-handling.html
// We get to this middleware if 
	// we call `next` with anything inside. 
	// we throw an error inside of a middleware function
// Order matters, so having this after all of our routes (see us mounting those routes on line 20) is perfect because this error handling middleware can handle errors from all of the different areas of our application
app.use((error, req, res, next) => {

	//Here wer are just logging the error to our server console so that we might better address it
	console.error(error.stack);

	// We need to send a response for each request.
	// If there is no error.status already set, we are defaulting to 500. 
	// If there is no error.message already set, we are defaulting to 'Internal Error'
    res.status(error.status || 500).send(error.message || 'Internal Error')
});

// we are able to run sync on an individual model as well as on the Sequelize instance (as is the case here) we created (I named `db` in `./models/index.js`)
// the option `force: true` means Postgres will drop the table if it exists and then rebuild it based on the model definition we describe in our code (on `db` in `./models/index.js`)
db.sync({force: true})
	.then(() => {
		// Only after all of the tables have been created will we start our application
		app.listen(3000, function () {
			console.log('Message feelers out on port 3000')
		})
	})
	// We want to make sure to bind the console to ensure the appropriate context
	.catch(console.error.bind(console))