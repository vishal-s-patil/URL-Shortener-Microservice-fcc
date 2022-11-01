require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const validUrl = require('valid-url')
const shortid = require('shortid')
Url = require('./Url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
	res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
	const longUrl = req.body.url;

	if (!validUrl.isUri(longUrl)) {
		res.json({ error: 'invalid url' });
	}

	const baseUrl = 'https://url-shortener-microservice.freecodecamp.rocks/api/shorturl';
	const urlCode = shortid.generate();

	try {
		let url = await Url.findOne({ longUrl });

		if (url) {
			res.json({ original_url: longUrl, short_url: url.urlCode });
		}
		else {
			const shortUrl = baseUrl + '/' + urlCode
			url = new Url({
				longUrl,
				shortUrl,
				urlCode,
				date: new Date()
			})

			await url.save();
			res.json({ original_url: longUrl, short_url: url.urlCode });
		}
	}
	catch (err) {
		console.log(err);
		res.json({ error: 'server crashed' });
	}
})

app.get('/api/shorturl/:code', async (req, res) => {
	try {
		const url = await Url.findOne({ urlCode: req.params.code });
		if (url) {
			res.redirect(url.longUrl);
		}
		else {
			res.json({ error: 'invalid url' });
		}
	}
	catch (err) {
		console.log(err);
		res.json({ error: 'server carshed' });
	}
})

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
