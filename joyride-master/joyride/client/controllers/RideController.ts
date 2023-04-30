import * as express from 'express';
import Controller from '../interfaces/IController';
import rideModel from '../schemas/Ride';
import vehicleModel from '../schemas/Vehicle';
import groupModel from '../schemas/Groups';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

import { Types } from 'mongoose';

export default class RideController implements Controller {
	public path = '/ride';
	public router = express.Router();

	private ride = rideModel;
	private userVehicle = vehicleModel;
	private userGroup = groupModel;

	constructor() {
		this.initRoutes();
	}

	/**
	 * Initialize all the routes.
	 */
	public initRoutes() {
		this.router.get(this.path, this.getAllRides);
		this.router.get(`${this.path}/rides`, this.getEveryRide);
		this.router.post(`${this.path}/joinPool`, this.joinPool);
		this.router.get(`${this.path}/bydriver`, this.getAllRidesByDriverID);
		this.router.get(`${this.path}/:id`, this.getRideById);
		this.router.put(`${this.path}/:id`, this.modifyRide);
		this.router.delete(`${this.path}/:id`, this.deleteRide);
		this.router.delete(`${this.path}/deletePool/:id`, this.deleteRides);
		// this.router.delete(`${this.path}/delete`, this.deletePool);
		this.router.post(this.path, this.createRide);
		this.router.post(`${this.path}/getVehicleDetails`, this.getVehicle);
		this.router.post(
			`${this.path}/vehicleSubmit`,
			this.upload.single('licenseIdPicture'),
			this.addVehicle
		);
		this.router.get(`${this.path}/admin/cpoolstats`, this.getCPoolStats); //? completed pool stats
		this.router.get(`${this.path}/admin/apoolstats`, this.getAPoolStats); //? active pool stats
		this.router.get(`${this.path}/admin/cpoolstatsSev`, this.getCPoolStatsSev); //? active pool stats
		this.router.get(`${this.path}/admin/popcategory`, this.getPopCategory); //? popylar category
	}

	private storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'uploads/');
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname);
		},
	});

	private upload = multer({ storage: this.storage });

	private getPopCategory = async (
		request: express.Request,
		response: express.Response
	) => {
		// const popularCategories = await this.ride.aggregate([
		// 	{ $group: { _id: '$category', count: { $sum: 1 } } },
		// 	{ $sort: { count: -1 } },
		// 	{ $limit: 4 },
		// ]);

		const topCategories = await this.ride.aggregate([
			{
				$group: {
					_id: '$category',
					rideCount: { $sum: 1 },
					activeCount: {
						$sum: {
							$cond: { if: { $eq: ['$completed', false] }, then: 1, else: 0 },
						},
					},
					completedCount: {
						$sum: {
							$cond: {
								if: { $eq: ['$completed', true] },
								then: 1,
								else: 0,
							},
						},
					},
				},
			},
			{ $sort: { rideCount: -1 } },
			{ $limit: 4 },
		]);
		// re.json(topCategories);

		console.log('get pop cate', topCategories);
		response.json({ topCategories });
	};

	private getCPoolStatsSev = async (
		request: express.Request,
		response: express.Response
	) => {
		const currentDate = new Date();
		const startDate = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() - 7
		);
		let timeDiff;

		const completedRidesCount = await this.ride.countDocuments({
			completedTime: {
				$gte: startDate,
			},
		});

		const pool = await this.ride
			.findOne({ completed: true })
			.sort({ completedTime: -1 });

		if (pool) {
			const completedTime = new Date(pool.completedTime);
			const currentTime = new Date();
			const timeDiffInMs = currentTime.getTime() - completedTime.getTime();

			// let timeDiffInHours = Math.round(timeDiffInMs / (1000 * 60 * 60));

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

			console.log('hehe', timeDiff);
		} else {
			console.log('No completed pools found');
		}

		console.log('Completed rides in the last 7 days:', completedRidesCount);
		response.json({ completedRidesCount, timeDiff });
	};

	private getCPoolStats = async (
		request: express.Request,
		response: express.Response
	) => {
		// response.send("");
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

			const rides = await this.ride.find({});

			const ridesInMonth = rides.filter((ride) => {
				if (ride.completed) {
					const rideCreatedAt = new ObjectId(ride._id).getTimestamp();
					return rideCreatedAt >= startOfMonth && rideCreatedAt < endOfMonth;
				}
			});

			stats[startOfMonth.toLocaleString('default', { month: 'long' })] =
				ridesInMonth.length;
		}

		response.json(stats);
		response.status(202);
	};

	private getAPoolStats = async (
		request: express.Request,
		response: express.Response
	) => {
		// response.send("");
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

			const rides = await this.ride.find({});

			const ridesInMonth = rides.filter((ride) => {
				if (!ride.completed) {
					const rideCreatedAt = new ObjectId(ride._id).getTimestamp();
					return rideCreatedAt >= startOfMonth && rideCreatedAt < endOfMonth;
				}
			});

			stats[startOfMonth.toLocaleString('default', { month: 'long' })] =
				ridesInMonth.length;
		}

		response.json(stats);
		response.status(202);
	};

	private joinPool = (request: express.Request, response: express.Response) => {
		// var ObjectId = require('mongoose').Types.ObjectId;
		const { memberID, poolID, waypoint } = request.body;

		this.ride
			.updateOne(
				{
					_id: Types.ObjectId(poolID),
				},
				{
					$push: {
						poolMembers: {
							memberID: memberID,
							waypoint: waypoint,
						},
					},
				}
			)
			.then(() => {
				response.sendStatus(200);
			})
			.catch((err) => {
				console.log('err in updating poolmembers arr', err);
				response.sendStatus(400);
			});
	};

	private getEveryRide = (
		request: express.Request,
		response: express.Response
	) => {
		this.ride
			.find()
			.then((data) => {
				response.send(data);
			})
			.catch((err) => {
				console.log('err in geteveryride', err);
			});
	};

	private addVehicle = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('inside add vehicle');
		// Should be a Ivehicle interface

		const {
			vehicleType,
			vehicleRegNo,
			vehicleSpecification,
			driverID,
			licenseID,
		} = request.body;

		// Upload the licenseId file
		const licenseIdPicture = request.file;
		console.log('license id picture', request.file);
		if (!licenseIdPicture) {
			response.status(400).send('Please upload a file');
			return;
		}

		console.log('received data:');
		console.log(request.body);

		// Rename the file to driverID
		const oldPath = licenseIdPicture.path;
		const newPath = oldPath.replace(
			licenseIdPicture.filename,
			driverID + path.extname(licenseIdPicture.originalname)
		);
		fs.renameSync(oldPath, newPath);

		const createdVehicle = new this.userVehicle({
			vehicleType,
			vehicleRegNo,
			vehicleSpecification,
			driverID,
			licenseID,
			licenseIdPicture: licenseIdPicture.path,
		});
		createdVehicle
			.save()
			.then((savedPost) => {
				console.log('savedPost', savedPost);
				response.sendStatus(200);
			})
			.catch((err) => {
				console.log('err in posting vehicle details', err);
				response.sendStatus(404);
			});
	};

	private getVehicle = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('called getVehicle');
		console.log('request.body', request.body);
		console.log('helooooo');

		const driverID = request.body.driverID;
		console.log('driverID', driverID);
		// const emailID = loginData.emailID;

		this.userVehicle.findOne({ driverID: driverID }).then((founduser) => {
			if (founduser) {
				console.log('founduser', founduser);
				response.sendStatus(200);
				// response.send(founduser);
			} else {
				console.log('user not found');
				response.sendStatus(400);
			}
		});
	};
	/**
	 * Get all the entries following the Ride schema.
	 */
	private getAllRides = (
		request: express.Request,
		response: express.Response
	) => {
		console.log('get list of rides');

		// If direction is specificed, show only one direction.
		const dir = request.query?.dir?.valueOf();

		// If date is specificed, show only dates greater than or equal to that one.
		const date = new Date(request.query.date.valueOf().toString());

		// When ready, specify also $lte in the date filter.
		// (https://stackoverflow.com/questions/39940595/gte-and-lte-in-mongoose-with-multiple-condition)
		// Sort rides in order.
		if (dir) {
			this.ride
				.find({
					category: dir,
					date: {
						$gte: date,
					},
				})
				.sort({ date: '1' })
				.then((rides) => {
					response.send(rides);
				});
		} else {
			this.ride.find().then((rides) => {
				response.send(rides);
			});
		}
	};

	/**
	 * Get all the entries following the Ride schema.
	 */
	private getAllRidesByDriverID = (
		request: express.Request,
		response: express.Response
	) => {
		// Get the driverID
		console.log('rides by driver called');

		const driverID = request.query?.driverID?.valueOf();
		const date = new Date();

		// Sort rides in order.
		try {
			if (driverID) {
				this.ride
					.find({
						driverID: driverID,
						// date: {
						// 	$gte: date,
						// },
					})
					.sort({ date: '1' })
					.then((rides) => {
						console.log('rides by driver', rides);
						response.send(rides);
					});
			} else {
				console.log('no driver id');
				response.send();
			}
		} catch {
			response.send();
		}
	};

	/**
	 * Get a ride by the specific ID.
	 */
	private getRideById = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		console.log(id);
		this.ride.findById(id).then((ride) => {
			response.send(ride);
		});
	};

	/**
	 * Update information regarding a ride.
	 */
	private modifyRide = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		// const rideData = request.body;
		this.ride
			.findByIdAndUpdate(
				id,
				{ completed: true, completedTime: new Date() },
				{ new: true }
			)
			.then(() => {
				response.sendStatus(200);
			})
			.catch((err) => {
				console.log('err in updating completed variable', err);
				response.sendStatus(400);
			});
	};

	/**
	 * Add a new ride to the database.
	 */
	private createRide = (
		request: express.Request,
		response: express.Response
	) => {
		// Should be a IRide interface
		const rideData = request.body;
		console.log('received data:');
		console.log(request.body);
		const createdRide = new this.ride(rideData);
		createdRide.save().then((savedPost) => {
			response.send(savedPost);
		});
	};

	/**
	 * Delete a ride by its ID number.
	 */
	private deleteRide = (
		request: express.Request,
		response: express.Response
	) => {
		const id = request.params.id;
		this.ride.findByIdAndDelete(Types.ObjectId(id)).then((successResponse) => {
			if (successResponse) {
				response.sendStatus(200);
			} else {
				response.sendStatus(404);
			}
		});
	};

	private deleteRides = (
		request: express.Request,
		response: express.Response
	) => {
		const driverID = request.params.id;

		this.ride.deleteMany({ driverID: driverID }).then((successResponse) => {
			if (successResponse) {
				response.sendStatus(200);
			} else {
				response.sendStatus(404);
			}
		});
	};
}
