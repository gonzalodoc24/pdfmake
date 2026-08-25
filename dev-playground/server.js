
var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var pdfmake = require('../js/index');

var app = express();

var PLAYGROUND_USER = process.env.PLAYGROUND_USER;
var PLAYGROUND_PASSWORD = process.env.PLAYGROUND_PASSWORD;

if (PLAYGROUND_USER && PLAYGROUND_PASSWORD) {
	app.use(function (req, res, next) {
		var token = (req.headers.authorization || '').split(' ')[1] || '';
		var decoded = Buffer.from(token, 'base64').toString();
		var separatorIndex = decoded.indexOf(':');
		var user = decoded.substring(0, separatorIndex);
		var password = decoded.substring(separatorIndex + 1);

		if (user === PLAYGROUND_USER && password === PLAYGROUND_PASSWORD) {
			return next();
		}

		res.set('WWW-Authenticate', 'Basic realm="pdfmake playground"');
		res.status(401).send('Authentication required');
	});
} else {
	console.warn('PLAYGROUND_USER/PLAYGROUND_PASSWORD not set - playground is running WITHOUT authentication');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

function createPdfBinary(docDefinition) {
	var fonts = {
		Roboto: {
			normal: path.join(__dirname, '..', 'fonts', 'Roboto', 'Roboto-Regular.ttf'),
			bold: path.join(__dirname, '..', 'fonts', 'Roboto', 'Roboto-Medium.ttf'),
			italics: path.join(__dirname, '..', 'fonts', 'Roboto', 'Roboto-Italic.ttf'),
			bolditalics: path.join(__dirname, '..', 'fonts', 'Roboto', 'Roboto-MediumItalic.ttf')
		}
	};

	pdfmake.setFonts(fonts);

	var pdf = pdfmake.createPdf(docDefinition);
	return pdf.getDataUrl();
}

app.post('/pdf', function (req, res) {
	const dd = new Function(req.body.content + '; return dd;')();

	createPdfBinary(dd).then(function (binary) {
		res.contentType('application/pdf');
		res.send(binary);
	}, function (error) {
		res.status(500).send('ERROR:' + error);
	});

});

var server = http.createServer(app);
var port = process.env.PORT || 1234;
server.listen(port);

console.log('http server listening on port %d', port);
console.log('dev-playground is available at http://localhost:%d', port);
