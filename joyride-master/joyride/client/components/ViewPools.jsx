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
		this.handleDelete = this.handleDelete.bind(this);
		this.displayRides = this.displayRides.bind(this);

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
				self.setState({
					Rides: arr,
				});
				console.log('data', data);
				console.log('rides in getting', this.state.Rides);
			});
	}

	handleDelete(id) {
		console.log('ride to be deleted:', id);

		const uri = `http://localhost:${process.env.PORT}/ride/${id}`;

		self = this;

		fetch(uri, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then( (response) => {
				if (response.status === 200) {
					window.location.reload();
				}
			})
			.catch((err)=> {
				console.log('Request failed', err);
			});
	}

	displayRides() {
		console.log('rides in display', this.state.Rides);
		// console.log('rides in category', this.state.Rides[0].category);

		// let rideGroups = [];
		// if (this.state.Rides.length > 0) {
		// 	for (let ride of this.state.Rides) {
		// 		rideGroups.push(<p>{ride.category}</p>);
		// 	}
		// 	return rideGroups;
		// } else {
		// 	return <div id="NoRides">No rides yet!</div>;
		// }

		return null;
	}

	render() {
		return (
			<div>
				<this.displayRides />
			</div>
		);
	}
}
