import React, { Component } from 'react';
import '../css/App.css';
import DynamicRides from './DynamicRides.jsx';

import 'react-datepicker/dist/react-datepicker.css';

/**
 * Front page with all the rides available, subject to filter.
 * @TODO make Listings actionable to contact the driver and populate firstname/lastname from userID.
 */
class Listings extends Component {
	constructor(props) {
		super(props);

		this.state = {
			ChiToChamp: true,
			searchDate: new Date(),
			Rides: null,
			category: '',
		};

		this.handleClick = this.handleClick.bind(this);
		this.handleCategoryChange = this.handleCategoryChange.bind(this);
		this.getAllRides = this.getAllRides.bind(this);

		this.getAllRides();
	}

	/**
	 * Depending on state, get the list of all relevant rides from mongodb.
	 */

	getAllRides() {
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
				const map = new Map();
				data.forEach((ride) => {
					if (map.has(ride.category)) {
						const arr = map.get(ride.category);
						arr.push(ride);
						map.set(ride.category, arr);
					} else {
						const arr = [ride];
						map.set(ride.category, arr);
					}
				});
				self.setState({
					Rides: map,
				});
				console.log('data', data);
			});
	}

	async handleClick() {
		console.log('clicked.....');
		const uri = `http://localhost:${process.env.PORT}/user/checktoken`;

		const self = this;

		const func = () =>
			fetch(uri, {
				method: 'POST',
			}).then(function (response) {
				// Check if login worked. If not, then show not logged in.
				if (response.status == 404 || response.status == 401) {
					self.setState((state) => ({
						loggedIn: false,
					}));
				}
				const res = response.json();
				console.log(res);
				return res;
			});
		const auth = await func();
		console.log('auth', auth);
	}

	handleCategoryChange(event) {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	}

	render() {
		// showShowEdit should be flipped to false after testing.
		const categories = this.state.Rides
			? Array.from(this.state.Rides.keys())
			: [];
		return (
			<div className="Listing">
				<select
					className="NewRideFormInput"
					name="category"
					value={this.state.category}
					onChange={this.handleCategoryChange}
				>
					{categories.map((category) => {
						return (
							<option key={category} value={category}>
								{category}
							</option>
						);
					})}
				</select>
				{this.state.Rides && this.state.category && (
					<div>
						<DynamicRides
							rides={this.state.Rides.get(this.state.category)}
							shouldShowJoin={true}
						></DynamicRides>
					</div>
				)}
			</div>
		);
	}
}

export default Listings;
