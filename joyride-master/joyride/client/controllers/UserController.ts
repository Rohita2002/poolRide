import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import Controller from '../interfaces/IController';
import userModel from '../schemas/User';
import { use } from 'passport';
import { cookie } from 'request';

import fs from 'fs';
import path from 'path';

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
		this.router.put(`${this.path}/:id`, this.verifyUser);
		this.router.put(`${this.path}/notVerify/:id`, this.notVerifyUser);
		this.router.put(`${this.path}`, this.modifyUser);
		this.router.post(`${this.path}/addFeedback`, this.addFeedback);
		this.router.get(`${this.path}/image/:imageName`, (req, res) => {
			const imagePath = path.join(
				__dirname,
				'../../uploads',
				req.params.imageName
			);
			if (fs.existsSync(imagePath)) {
				res.status(200).sendFile(imagePath);
			} else {
				res.status(404).send('Image not found');
			}
		});
		this.router.get(`${this.path}/admin/userstats`, this.getUserStats);
		this.router.get(`${this.path}/admin/userstats7days`, this.getUserStatsSev);
		this.router.get(`${this.path}/admin/feedbackstats`, this.getFeedbackStats);
	}

	private getUserStatsSev = async (
		request: express.Request,
		response: express.Response
	) => {
		const currentDate = new Date();
		const dayCount = 7;
		const stats = {};
		let totalCount = 0;

		for (let i = dayCount - 1; i >= 0; i--) {
			const date = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				currentDate.getDate() - i
			);
			const startDate = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate()
			);
			const endDate = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate() + 1
			);

			const users = await this.user.find({});

			const usersInDay = users.filter((user) => {
				const userCreatedAt = new ObjectId(user._id).getTimestamp();
				return userCreatedAt >= startDate && userCreatedAt < endDate;
			});

			totalCount += usersInDay.length;
		}

		console.log('total count', totalCount);

		const verifiedUserCount = await this.user.countDocuments({
			verified: true,
		});
		console.log('Number of verified users:', verifiedUserCount);

		const mostRecentUser = await this.user.findOne(
			{},
			{},
			{ sort: { _id: -1 } }
		);
		const timeDiffInMs =
			Date.now() - mostRecentUser._id.getTimestamp().getTime();

		let timeDiff;
		if (timeDiffInMs < 60 * 1000) {
			// If the time difference is less than 60 seconds, show it in seconds
			timeDiff = Math.floor(timeDiffInMs / 1000) + ' seconds';
		} else if (timeDiffInMs < 60 * 60 * 1000) {
			// If the time difference is less than 60 minutes, show it in minutes
			timeDiff = Math.floor(timeDiffInMs / 1000 / 60) + ' minutes';
		} else if (timeDiffInMs < 24 * 60 * 60 * 1000) {
			// If the time difference is less than 24 hours, show it in hours
			timeDiff = Math.floor(timeDiffInMs / 1000 / 60 / 60) + ' hours';
		} else {
			// Otherwise, show it in days
			timeDiff = Math.floor(timeDiffInMs / 1000 / 60 / 60 / 24) + ' days';
		}

		console.log('time diff', mostRecentUser, timeDiff);

		response.json({ totalCount, verifiedUserCount, timeDiff });
		response.status(202);
	};

	private getFeedbackStats = async (
		request: express.Request,
		response: express.Response
	) => {
		const currentDate = new Date();
		const dayCount = 7;
		const stats = {};

		for (let i = dayCount - 1; i >= 0; i--) {
			const date = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				currentDate.getDate() - i
			);
			const startDate = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate()
			);
			const endDate = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate() + 1
			);

			const users = await this.user.find({});

			const feedbacks = users.reduce((total, user) => {
				const userFeedbacks = user.feedback.filter((feedback) => {
					const feedbackDate = new Date(
						new ObjectId(feedback._id).getTimestamp()
					);
					return feedbackDate >= startDate && feedbackDate < endDate;
				});
				return total + userFeedbacks.length;
			}, 0);

			stats[date] = feedbacks;
		}

		response.status(202);
		response.json(stats);
	};

	private getUserStats = async (
		request: express.Request,
		response: express.Response
	) => {
		const currentDate = new Date();
		const monthCount = 7;
		const stats = {};

		for (let i = monthCount - 1; i >= 0; i--) {
			const startOfMonth = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() - i,
				1
			);
			const endOfMonth = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() - i + 1,
				1
			);

			const users = await this.user.find({});

			const usersInMonth = users.filter((user) => {
				const userCreatedAt = new ObjectId(user._id).getTimestamp();
				return userCreatedAt >= startOfMonth && userCreatedAt < endOfMonth;
			});

			stats[startOfMonth.toLocaleString('default', { month: 'long' })] =
				usersInMonth.length;
		}

		response.json(stats);
		response.status(202);
	};

	private notVerifyUser = async (
		request: express.Request,
		response: express.Response
	) => {
		console.log('inside user verification');
		try {
			const user = await this.user.findByIdAndUpdate(
				request.params.id,
				{ verified: false },
				{ new: true }
			);
			if (!user) {
				return response.status(404).json({ message: 'User not found' });
			}
			response.json(user);
		} catch (error) {
			console.error(error.message);
			response.status(500).json({ message: 'Server error' });
		}
	};

	private verifyUser = async (
		request: express.Request,
		response: express.Response
	) => {
		console.log('inside user verification');
		try {
			const user = await this.user.findByIdAndUpdate(
				request.params.id,
				{ verified: true },
				{ new: true }
			);
			if (!user) {
				return response.status(404).json({ message: 'User not found' });
			}
			response.json(user);
		} catch (error) {
			console.error(error.message);
			response.status(500).json({ message: 'Server error' });
		}
	};

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
