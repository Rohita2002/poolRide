import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import Controller from '../interfaces/IController';
import userModel from '../schemas/User';
import { use } from 'passport';
import { cookie } from 'request';

/**
 * Controller class for the user.
 * @TODO write functions for updating, deleting, and getting user.
 */
export default class UserController implements Controller {
	public path = '/user';
	public router = express.Router();

	private user = userModel;

	constructor() {
		this.initRoutes();
	}

	/**
	 * Initialize all routes
	 */
	public initRoutes() {
		this.router.get(`${this.path}/allusers`, this.getAllusers);
		this.router.get(`${this.path}/:id`, this.getUserById);
		this.router.post(`${this.path}/logout`, this.logOut);
		this.router.post(`${this.path}/login`, this.login);
		this.router.post(`${this.path}/checktoken`, this.checkToken);
		this.router.post(`${this.path}/signup`, this.createNewUser);
		this.router.delete(`${this.path}/:id`, this.deleteUser);
		this.router.put(`${this.path}`, this.modifyUser);
		this.router.post(`${this.path}/addFeedback`, this.addFeedback);
	}

	/**
	 * New user sign up.
	 * @TODO save encrypted passwords.
	 */
	private createNewUser = async (
		request: express.Request,
		response: express.Response
	) => {
		console.log('create new user');
		const userData = request.body;
		if (await this.user.findOne({ emailID: userData.emailID })) {
			response.status(401).json({
				success: false,
				message: 'User already exists',
			});
		} else {
			const hashedPassword = await bcrypt.hash(userData.password, 10);
			userData.password = hashedPassword;
			console.log(userData);

			const createdUser = new this.user(userData);
			createdUser.save().then((savedUser) => {
				response.send(savedUser);
			});
		}
	};

	/**
	 * Get a specific user's information.
	 * @TODO make this so that it's only accessible by a user with the correct JWT Token.
	 */
	private getUserById = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('get user by id');
		const id = request.params.id;
		this.user.findById(id).then((founduser) => {
			if (founduser) {
				response.send(founduser);
			} else {
				response.sendStatus(404);
			}
		});
	};
	/**
	 * Delete a user.
	 */
	private deleteUser = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		this.user.findByIdAndDelete(id).then((successResponse) => {
			if (successResponse) {
				response.sendStatus(200);
			} else {
				response.sendStatus(404);
			}
		});
	};

	/**
	 * Modify user data.
	 */
	private modifyUser = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		const userData = request.body;
		this.user.findByIdAndUpdate(id, userData, { new: true }).then((ride) => {
			response.send(ride);
		});
	};

	private addFeedback = (
		request: express.Request,
		response: express.Response
	) => {
		// Assuming you have the driverID, message, and rating stored in variables
		const { userID, driverID, message, stars } = request.body;

		const newFeedback = {
			fromID: userID,
			message: message,
			rating: stars,
		};

		this.user
			.findByIdAndUpdate(
				driverID,
				{ $push: { feedback: newFeedback } },
				{ new: true }
			)
			.then(() => {
				response.sendStatus(200);
			})
			.catch((err) => {
				console.error('Error updating user:', err);
				response.status(500).json({ error: 'Error updating user' });
			});
	};

	/**
	 * Get all users.
	 */
	private getAllusers = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('get all users');
		this.user.find().then((users) => {
			response.send(users);
		});
	};

	/**
	 * Login user from email and password.
	 * @TODO use encryption to process the passwords.
	 */
	private login = (request: express.Request, response: express.Response) => {
		console.log('called login');
		const loginData = request.body;
		const emailID = loginData.emailID;

		this.user.findOne({ emailID: emailID }).then(async (founduser) => {
			if (founduser) {
				const isCorrectPassword = await bcrypt.compare(
					loginData.password,
					founduser.password.toString()
				);
				if (isCorrectPassword) {
					// Create a token and attach it to the header.
					console.log(founduser);
					// const tokenData = this.createToken(founduser._id);
					// console.log('set cookie');
					// const cookie = this.createCookie(tokenData);
					// response.setHeader('Set-Cookie', [cookie]);
					// console.log('created cookie in backend', cookie);

					return response.status(200).json({
						success: true,
						userID: founduser._id,
					});
					// response.send(tokenData);
				} else {
					return response.status(401).json({
						success: false,
						message: 'Incorrect credentials',
					});
				}
			} else {
				console.log('user not found');
				return response.status(404).json({
					success: false,
					message: 'User not found',
				});
			}
		});
	};

	/**
	 * Create a new signed JSON Web Token.
	 * @param id ID from a user object.
	 */
	private createToken(id) {
		// SIGNING OPTIONS
		// const signOptions = {
		// 	expiresIn: '168h',
		// };

		const token = jwt.sign({ id }, process.env.PRIVATE_KEY, {
			expiresIn: 24 * 60 * 60,
		});

		return token;
	}

	/**
	 * Check if a JWT is active and valid.
	 */
	private checkToken = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('check cookie method');
		// Get token from cookies.
		// const cookies = request.cookies;
		// console.log('cookie in checkToken', request.body);
		if (request.body) {
			const token = request.body;

			// Verify that the token is valid and active.
			jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
				if (err) {
					return response.status(404).json({
						success: false,
						message: 'Invalid token',
					});
				} else {
					// If valid token, get the current user.
					console.log('decoded id', decoded.id);
					this.user.findById(decoded.id).then((founduser) => {
						if (founduser) {
							return response.status(200).json({
								success: true,
								founduser,
							});
						} else {
							response.status(404).json({
								success: false,
								message: 'User not found',
							});
						}
					});
				}
			});
		} else {
			// No user was logged in.
			return response.status(401).json({
				success: false,
				message: 'User not logged in',
			});
		}
	};

	/**
	 * Create cookie from token to be stored in the user's site.
	 * @param token token returned from JWT sign
	 */
	// private createCookie(token) {
	// 	return `Authorization=${token}; HttpOnly; Max-Età=${token.expiresIn}`;
	// }
	private createCookie(token) {
		// const secure = process.env.NODE_ENV === 'production';
		return `Authorization=${token}; HttpOnly; SameSite=Strict; Secure=false; Max-Age=${token.expiresIn}; path= /, domain=http://localhost`;
	}

	/**
	 * Sign out the user.
	 */
	private logOut = (request: express.Request, response: express.Response) => {
		response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
		response.sendStatus(200);
	};
}
