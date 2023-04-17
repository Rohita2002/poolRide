import React, { Component } from 'react';

/**
 * The about page.
 */
export default class ViewPools extends Component {
	constructor(props) {
		super(props);

		this.state = {
			Rides: null,
		};

		this.getEveryRide = this.getEveryRide.bind(this);
		// this.handleDelete = this.handleDelete.bind(this);
		// this.displayRides = this.displayRides.bind(this);

		this.getEveryRide();
	}

	getEveryRide() {
		const uri = `http://localhost:${process.env.PORT}/ride/rides`;

		// Get user id and send it in with the post request.

		self = this;

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
				self.setState((state) => ({
					Rides: arr,
				}));
				console.log('data', data);
				console.log('rides in getting', this.state.Rides);
			});
	}

	// handleDelete(id) {
	// 	console.log('ride to be deleted:', id);
	// }

	// displayRides() {
	// 	let rideGroups = [];
	// 	if (this.state.Rides.length > 0) {
	// 		for (let ride of this.state.Rides) {
	// 			rideGroups.push(
	// 				<tr key={ride._id}>
	// 					<td>{index + 1}</td>
	// 					<td>{ride.departure}</td>
	// 					<td>{ride.destination}</td>
	// 					<td>
	// 						<button onClick={() => this.handleDelete(ride._id)}>
	// 							Delete
	// 						</button>
	// 					</td>
	// 				</tr>
	// 			);
	// 		}
	// 		return rideGroups;
	// 	} else {
	// 		return <div id="NoRides">No rides yet!</div>;
	// 	}
	// }

	render() {
		return (
			<div>
				{/* <table>
					<thead>
						<tr>
							<th>Serial No.</th>
							<th>Departure</th>
							<th>Destination</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						<this.displayRides />
					</tbody>
				</table> */}
				viewing pools
			</div>
		);
	}
}
