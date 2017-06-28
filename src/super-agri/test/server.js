/**
 * Created by qtisa on 2017/6/28.
 */

const express = require('express');
const http = require('http');
const app = express();

const complexFetch = require('../worm.extreme/fetch');

app.get('/worm', (req, res, next) => {

	const { area = '', rgmx = 3, pesticide = 2, crop = 4, pest = 4, factory = 2 } = req.query;
	complexFetch({ area, rgmx, pesticide, crop, pest, factory }, (err, list) => {
		if (!err) {
			res.json(list);
		}
		next(err);
	});

});

const server = http.createServer(app);
server.on('listening', () => console.log(`server listening on 8110.`));
server.listen(8110);

