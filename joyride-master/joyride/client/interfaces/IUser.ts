/**
 * Interface for User schema.
 */
export interface IUser {
	firstname: String;
	lastname: String;
	username: String;
	emailID: String;
	mobileNumber: String;
	password: String;
	verified: Boolean;
	feedback: [
		{
			fromID: String;
			message: String;
			rating: Number;
		}
	];

	// aboutme: String,
	// license: String
}
