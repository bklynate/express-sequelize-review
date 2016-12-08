### How to run this:

- `npm install`
- go to our models and see what our database should be named (look at the connection string)
- create the appropriate database in Postgres
- `npm start` (see the package.json for what this script is doing)
- use `curl` or Postman to make post, put and delete requests and add, mutate and destroy data
- go to the appropriate port (check out the `app.listen` to determine this) and see us statically serving a file
- go to specific `GET` routes (the browser only makes GET requests from the URL bar) 
	* Follow our server to see what the routes should be named (`app.js` includes which files with what path)
	* You should see JSON objects as a result of these routes


### How to make POST requests in Postman:
- Start in the `Builder` tab
- Choose the appropriate verb from the drop-down (`POST`)
- Where it says `Enter request URL` type `localhost:3000/api/trains`
- Below this, select `Body`
	- We are only parsing if it is `urlencoded` or `json`, so we need to choose one of these
	- With `x-www-form-urlencoded` selected:
		- type `name` in `key` and `Thomas` in `value`
		- type `type` in `key` and `Train Engine` in `value`
	- With `raw` selected:
		- In the orange drop-down to the right of `raw` choose `JSON`
		- type ```{
					"name":"Thomas",
					"type": "Train Engine"
				}``` This is JSON
- Click the blue `Send` button to the right of where you typed the URL
- You should see the response immediately below the `Body` form area
	- Select the response `Body` tab and `Pretty` tab and see the response as a JSON object which should have `fullName` (our virtual), `id`, `name`, `type`, `updatedAt`, and `createdAt`
- Now start experimenting on your own!