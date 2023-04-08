import { Document, Model, Schema, model } from "mongoose";
import { IGroups } from '../interfaces/IGroups';

// @TODO determine which fields I want to keep in generic user.

/**
 * Schema for basic user object in MongoDB.
 * email must be @illinois.edu
 */
const groupSchema = new Schema({
    category : String,
    // license: String,
    // aboutme: String
});

const groupModel = model<IGroups & Document>('group', groupSchema);
export default groupModel;