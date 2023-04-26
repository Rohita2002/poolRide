const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

class App {
	public app;

	constructor(controllers) {
		this.app = express();

		this.connectToTheDatabase();
		this.initializeMiddlewares();
		this.initializeControllers(controllers);
	}

	private initializeMiddlewares() {
		this.app.set('view engine', 'ejs');
		this.app.set('views', path.join(__dirname, '../client'));
		this.app.use(express.static(path.join(__dirname, '../client')));
		// this.app.use(bodyParser.json());
		this.app.use(express.json());
		this.app.use(cookieParser());

		let corsOptions = {
			origin: '*',
			methods: ['GET', 'PUT', 'POST', 'DELETE'],
			allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
		};

		this.app.use(cors(corsOptions));

		// this.app.use(
		// 	cors({
		// 		origin: 'http://127.0.0.1:3000',
		// 	})
		// );
		// this.app.use(function (req, res, next) {
		// 	res.header('Access-Control-Allow-Origin', ' http://localhost:3000'); // update to match the domain you will make the request from
		// 	res.header(
		// 		'Access-Control-Allow-Headers',
		// 		'Origin, X-Requested-With, Content-Type, Accept'
		// 	);
		// 	next();
		// });

		this.app.use(function (req, res, next) {
			res.header('Access-Control-Allow-Credentials', 'true');
			// res.header('Access-Control-Allow-Origin', req.headers.origin);
			res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
			res.header(
				'Access-Control-Allow-Headers',
				'Origin, X-Requested-With, Content-Type, Accept'
			);
			next();
		});
	}

	public getServer() {
		console.log('got server');
		return this.app;
	}

	listen() {
		this.app.listen(process.env.PORT, () => {
			console.log(`listening to port ${process.env.PORT}`);
		});
	}

	private initializeControllers(controllers) {
		console.log('init routers');
		controllers.forEach((controller) => {
			this.app.use('/', controller.router);
		});

		var router = express.Router();
		router.get('*', function (req, res) {
			res.render('index');
		});

		this.app.use('/', router);
	}

	private connectToTheDatabase() {
		const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;

		const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`;
		console.log(uri);
		// mongoose way
		mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		const db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function () {
			console.log('successfully connected');
		});
	}
}

export default App;
