import { Document, Model, Schema, model } from 'mongoose';
import { IUser } from '../interfaces/IUser';

// @TODO determine which fields I want to keep in generic user.

/**
 * Schema for basic user object in MongoDB.
 * email must be @illinois.edu
 */

// const feedbackSchema = new Schema({
// 	fromID: String,
// 	message: String,
// 	rating: Number,
// });

const userSchema = new Schema({
	firstname: String,
	lastname: String,
	username: String,
	emailID: String,
	mobileNumber: String,
	password: String,
	verified: Boolean,
	feedback: [
		{
			fromID: String,
			message: String,
			rating: Number,
		},
	],
	// feedback: feedbackSchema,
});

const userModel = model<IUser & Document>('User', userSchema);
export default userModel;
