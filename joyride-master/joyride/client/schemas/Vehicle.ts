import { Document, Model, Schema, model } from 'mongoose';
import { IVehicle } from '../interfaces/IVehicle';

// @TODO determine which fields I want to keep in generic user.

/**
 * Schema for basic user object in MongoDB.
 * email must be @illinois.edu
 */
const vehicleSchema = new Schema({
	vehicleType: String,
	vehicleRegNo: String,
	vehicleSpecification: String,
	driverID: String,
	licenseID: String,
	licenseIdPicture: String,
});

const vehicleModel = model<IVehicle & Document>('vehicle', vehicleSchema);
export default vehicleModel;
