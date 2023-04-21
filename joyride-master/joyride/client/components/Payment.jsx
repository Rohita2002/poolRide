import React, { Component } from 'react';

export default class Payment extends Component {
	constructor(props) {
		super(props);

		this.state = {
			poolDetails: JSON.parse(localStorage.getItem('poolDetails')),
			poolers: [],
		};

		// this.getAllPoolMembers = this.getAllPoolMembers.bind(this);
		this.handleArchive = this.handleArchive.bind(this);

		this.getAllPoolMembers();
	}

	getAllPoolMembers() {
		const arr = [];

		this.state.poolDetails.poolMembers.forEach((id) => {
			const uri = `http://localhost:${process.env.PORT}/user/${id.memberID}`;

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
					arr.push(data);

					// Move this.setState() and console.log() inside the last .then() callback
					if (arr.length === this.state.poolDetails.poolMembers.length) {
						this.setState(
							{
								poolers: arr,
							},
							() => {
								console.log('poolers:', this.state.poolers);
								console.log('arr:', arr);
							}
						);
					}
				})
				.catch((error) => {
					console.error('Error fetching user data:', error);
				});
		});
	}

	handleArchive() {
		console.log('clicked on archive');

		window.location.replace('/homeuser');
	}

	render() {
		console.log('pool details payment:', this.state.poolDetails.departure);
		return (
			<div>
				{this.state.poolers.length && (
					<table>
						<thead>
							<tr>
								<th>Serial No.</th>
								<th>First Name</th>
								<th>Waypoint</th>
								<th>Price</th>
							</tr>
						</thead>
						<tbody>
							{this.state.poolers?.map((user, index) => (
								<tr key={user._id}>
									<td>{index + 1}</td>
									<td>{user.firstname}</td>
									<td>-</td>
									<td>
										The price will be intimated at ur drop off location by the
										driver.
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
				{!this.state.poolers.length && <h3>No riders for this ride.</h3>}
				<button onClick={this.handleArchive}>Archive</button>
			</div>
		);
	}
}
