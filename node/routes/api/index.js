module.exports = function(app, io) {
	/**
	 * App Alive Interface
	 */
	app.get('/', function(req, res, next) {
		res.end(JSON.stringify({"app": true}));
	});

	require('./cameras')(app, io);
	require('./screenshots')(app, io);
}