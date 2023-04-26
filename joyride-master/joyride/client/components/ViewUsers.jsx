import React, { Component } from 'react';

/**
 * The about page.
 */
export default class ViewUsers extends Component {
	constructor(props) {
		super(props);

		this.state = {
			Users: [],
			vehicles: [],
		};

		this.getAllUsers = this.getAllUsers.bind(this);
		this.deleteUserAndVehicleAndPools =
			this.deleteUserAndVehicleAndPools.bind(this);
		this.calculateAverageRating = this.calculateAverageRating.bind(this);
		this.displayStars = this.displayStars.bind(this);
		this.getAllVehicles = this.getAllVehicles.bind(this);

		this.getAllUsers();
		this.getAllVehicles();
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
					if (user.emailID !== 'admin@gmail.com') arr.push(user);
				});
				self.setState({
					Users: arr,
				});
				console.log('data', data);
				// console.log('users in getting', Users);
			});
	}

	getAllVehicles() {
		const uri = `http://localhost:${process.env.PORT}/vehicle/allvehicles`;

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
				data.forEach((vehicle) => {
					arr.push(vehicle);
				});
				self.setState({
					vehicles: arr,
				});
				console.log('data', data);
				// console.log('users in getting', Users);
			});
	}

	deleteUserAndVehicleAndPools(userId) {
		// Delete the user
		fetch(`http://localhost:${process.env.PORT}/user/${userId}`, {
			method: 'DELETE',
		})
			.then((response) => {
				if (response.status !== 200) {
					console.log('Failed to delete user');
				}
				console.log('User deleted successfully');

				// Delete the vehicle belonging to the user
				return fetch(`http://localhost:${process.env.PORT}/vehicle/${userId}`, {
					method: 'DELETE',
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

	calculateAverageRating(feedback) {
		const total = feedback.reduce((acc, curr) => acc + curr.rating, 0);
		const avg = total / feedback.length;
		return avg.toFixed(1);
	}

	displayStars(numStars, maxStars) {
		const fullStars = Math.floor(numStars);
		console.log('fullstars', fullStars);
		const halfStar = numStars % 1 >= 0.5 ? '★' : '☆';
		console.log('mod', numStars % 1);
		console.log('half stars', halfStar);
		const emptyStars = maxStars - fullStars - (halfStar === '★' ? 1 : 0);
		console.log('empty stars', emptyStars);

		const stars =
			numStars % 1 >= 0.5
				? '★'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars)
				: '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
		// if (halfStar === 1) {
		// 	const stars = '★'.repeat(fullStars) + '☆'.repeat(emptyStars) + halfStar;
		// } else {
		// 	const stars = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
		// }

		console.log('stars', stars);
		return stars;
	}

	render() {
		console.log('users in main', this.state.Users);

		return (
			<div>
				<table>
					<thead>
						<tr>
							<th>#</th>
							<th>First Name</th>
							<th>Username</th>
							<th>Email ID</th>
							<th>Mobile Number</th>
							<th>Feedback</th>
							<th>Average Rating</th>
							<th>Driver License</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{this.state.Users?.map((user, index) => (
							<tr key={user._id}>
								<td>{index + 1}</td>
								<td>{user.firstname}</td>
								<td>{user.username}</td>
								<td>{user.emailID}</td>
								<td>{user.mobileNumber}</td>
								<td>
									{/* <h4>Recent Feedbacks</h4> */}
									{user.feedback.slice(0, 3).map((feedback, idx) => (
										<div key={idx}>
											<p>
												{idx + 1}. Message: {feedback.message}
											</p>
											<p>Rating: {this.displayStars(feedback.rating, 5)}</p>
										</div>
									))}
								</td>
								<td>
									{/* <h4>Average Rating</h4> */}
									{user.feedback.length > 0 ? (
										<div>
											<p>
												{this.displayStars(
													this.calculateAverageRating(user.feedback),
													5
												)}
											</p>
										</div>
									) : (
										<p>No ratings yet</p>
									)}
								</td>
								{this.state.vehicles.some(
									(vehicle) => vehicle.driverID === user._id
								) ? (
									<p>Has vehicle</p>
								) : (
									<p>No Vehicle</p>
								)}
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
