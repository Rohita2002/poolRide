import React, { Component } from 'react';

/**
 * The about page.
 */
export default class ViewPools extends Component {
	constructor(props) {
		super(props);

		this.state = {
			Rides: [],
		};

		this.getEveryRide = this.getEveryRide.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		// this.displayRides = this.displayRides.bind(this);

		this.getEveryRide();
	}

	getEveryRide() {
		const uri = `https://poolnride-api.onrender.com/ride/rides`;

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
				data.forEach((ride) => {
					arr.push(ride);
				});
				self.setState({
					Rides: arr,
				});
				console.log('data', data);
				console.log('rides in getting', Rides);
			});
	}

	handleDelete(id) {
		console.log('ride to be deleted:', id);

		const uri = `https://poolnride-api.onrender.com/ride/${id}`;

		self = this;

		fetch(uri, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				if (response.status === 200) {
					window.location.reload();
				}
			})
			.catch((err) => {
				console.log('Request failed', err);
			});
	}

	// displayRides() {
	// 	// event.preventDefault();
	// 	console.log('rides in display', this.state.Rides);
	// 	// console.log('rides in display', typeof this.state.Rides);
	// 	let rideGroups = [];
	// 	this.state.Rides.forEach((ride) => {
	// 		rideGroups.push(
	// 			<tr key={ride._id}>
	// 				<td>{index + 1}</td>
	// 				<td>{ride.departure}</td>
	// 				<td>{ride.destination}</td>
	// 				<td>
	// 					<button onClick={() => this.handleDelete(ride._id)}>Delete</button>
	// 				</td>
	// 			</tr>
	// 		);
	// 	});

	// 	return rideGroups;
	// }

	render() {
		return (
			<div>
				<table>
					<thead>
						<tr>
							<th>Serial No.</th>
							<th>Departure</th>
							<th>Destination</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{this.state.Rides.map((ride, index) => (
							<tr key={ride._id}>
								<td>{index + 1}</td>
								<td>{ride.departure}</td>
								<td>{ride.destination}</td>
								<td>
									<button onClick={() => this.handleDelete(ride._id)}>
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
