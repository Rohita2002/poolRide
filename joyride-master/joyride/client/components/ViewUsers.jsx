import React, { Component } from 'react';

/**
 * The about page.
 */
export default class ViewUsers extends Component {
	constructor(props) {
		super(props);

		this.state = {
			Users: [],
		};

		this.getAllUsers = this.getAllUsers.bind(this);
		// this.handleDelete = this.handleDelete.bind(this);
		this.deleteUserAndVehicleAndPools =
			this.deleteUserAndVehicleAndPools.bind(this);

		this.getAllUsers();
	}

	getAllUsers() {
		const uri = `http://localhost:${process.env.PORT}/user/allusers`;

		// Get user id and send it in with the post request.

		self = this;
		// const arr = [];

		fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				const arr = [];
				data.forEach((user) => {
					arr.push(user);
				});
				self.setState({
					Users: arr,
				});
				console.log('data', data);
				console.log('users in getting', Users);
			});
	}

	// handleDelete(id) {
	// 	console.log('user to be deleted:', id);

	// 	const uri = `http://localhost:${process.env.PORT}/user/${id}`;

	// 	self = this;

	// 	fetch(uri, {
	// 		method: 'DELETE',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 	})
	// 		.then((response) => {
	// 			if (response.status === 200) {
	// 				console.log('user deleted');
	// 				// window.location.reload();
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			console.log('Request failed', err);
	// 		});
	// }

	deleteUserAndVehicleAndPools(userId) {
		// Delete the user
		fetch(`http://localhost:${process.env.PORT}/user/${userId}`, {
			method: 'DELETE',
			// headers: {
			// 	'Content-Type': 'application/json',
			// },
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log('Failed to delete user');
				}
				console.log('User deleted successfully');

				// Delete the vehicle belonging to the user
				return fetch(`http://localhost:${process.env.PORT}/vehicle/${userId}`, {
					method: 'DELETE',
					// headers: {
					// 	'Content-Type': 'application/json',
					// },
				});
			})
			.then((response) => {
				if (response.status !== 200) {
					console.log('Failed to delete vehicle');
				}
				console.log('Vehicle deleted successfully');

				// Delete any pools associated with the user
				return fetch(
					`http://localhost:${process.env.PORT}/ride/deletePool/${userId}`,
					{
						method: 'DELETE',
						// headers: {
						// 	'Content-Type': 'application/json',
						// },
					}
				);
			})
			.then((response) => {
				if (response.status !== 200) {
					console.log('Failed to delete pools');
				}
				console.log('Pools deleted successfully');
				window.location.reload();
			})
			.catch((error) => {
				console.log('Error deleting user, vehicle, and pools:', error);
			});
	}

	render() {
		console.log('users in main', this.state.Users);

		return (
			<div>
				<table>
					<thead>
						<tr>
							<th>Serial No.</th>
							<th>First Name</th>
							<th>Email</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{this.state.Users?.map((user, index) => (
							<tr key={user._id}>
								<td>{index + 1}</td>
								<td>{user.firstname}</td>
								<td>{user.emailID}</td>
								<td>
									<button
										onClick={() => this.deleteUserAndVehicleAndPools(user._id)}
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}
