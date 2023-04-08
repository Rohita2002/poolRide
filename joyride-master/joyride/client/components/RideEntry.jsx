import React, { Component } from 'react';
import request from 'request';
import { Redirect } from 'react-router-dom';

/**
 * The basic architecture for displaying a ride in Listings.jsx.
 */
class RideEntry extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: '',
			userNotFound: false,
			shouldShowEdit: this.props.shouldShowEdit,
			shouldShowJoin: this.props.shouldShowJoin,
			editRide: false,
			poolDetails: this.props,
			poolID: '',
			memberID: '',
		};

		this.showDate = this.showDate.bind(this);
		this.showButton = this.showButton.bind(this);
		this.showPrice = this.showPrice.bind(this);
		this.handleEditRide = this.handleEditRide.bind(this);
		this.handleclick = this.handleclick.bind(this);
		this.checkToken = this.checkToken.bind(this);
        this.checkToken();
		this.getUser(this.props.driverID);

	}

	checkToken = async () => {
		const uri = `http://localhost:${process.env.PORT}/user/checktoken`;

		const self = this;

	

		const func = () => fetch(uri, {
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
		self.setState((state) => ({
			memberID: auth.founduser._id,
			poolID: this.state.poolDetails.rideID,
		}));

		// console.log('poolDetails', this.state.poolDetails);
	};

	async handleclick() {
		console.log('clicked.....');
		
		const joinPool = async () => {
			const uri = `http://localhost:${process.env.PORT}/ride/joinPool`;
			const self = this;
			const body = JSON.stringify(this.state);
			fetch(uri, {
				method: 'POST',
				body,
				headers: {
					'Content-Type': 'application/json',
				},
			}).then((response) => {
				if (response.status === 200) {
					console.log('joined');
				} else {
					console.log('not joined');
				}
			});
		};

		const joinpool = await joinPool();
		console.log('joinpool', joinpool);
		window.location.reload();
	}

	/**
	 * Prettify the date a little bit.
	 */
	showDate() {
		const date = new Date(this.props.date);

		const hours = date.getHours();

		const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

		return (
			<td className="RideEntryField" id="datestamp">
				{hours}:{minutes}
			</td>
		);
	}

	/**
	 * Show the button (edit or book) of ride if applicable.
	 */
	showButton() {
		if (this.state.shouldShowEdit) {
			return (
				<td>
					<button
						className="editButton"
						onClick={this.handleEditRide}
						type="button"
					>
						Edit
					</button>
				</td>
			);
		} else {
			return null;
		}
	}

	/**
	 * Render price of ride.
	 */
	showPrice() {
		if (this.props.price == 0) {
			return (
				<td>
					<p className="RideEntryFieldPrice">free</p>
				</td>
			);
		} else {
			return (
				<td>
					<p className="RideEntryFieldPrice">${this.props.price}</p>
				</td>
			);
		}
	}

	handleEditRide() {
		this.setState({
			editRide: true,
		});
	}

	/**
	 * From the ride object, extract the driver's ID to look them up in the DB and get relevant infos.
	 */
	getUser(driverID) {
		var uri = `http://localhost:${process.env.PORT}/user/${driverID}`;

		const self = this;

		request.get(uri, function (error, response, body) {
			// Print the error if one occurred
			if (error) {
				// Should the ride be deleted?
				console.error('error:', error);
				self.setState({
					userNotFound: true,
				});
			} else if (response.statusCode === 200) {
				self.setState({
					user: JSON.parse(body),
				});

				console.log('user in ride entry:' + self.state.user.firstname);
			}
		});
	}

	/**
	 * Render a listing.
	 */
	render() {
		// TODO: add a button to toggle the mode to edit. This button will only be visible if the driver id matches the userid. Should the edit button show up on the listings page? What should the edit page look like? Like the listing or like the new ride entry page? Answer: more like the new ride entry page.
		if (this.state.userNotFound) {
			return null;
		} else if (this.state.editRide) {
			return (
				<Redirect
					to={{
						pathname: '/editride',
						state: { rideID: this.props.rideID },
					}}
				/>
			);
		} else {
			let memberJoined = false;
			this.props.poolMembers?.forEach((element) => {
				console.log('element', element);
				console.log('this.state?.memberID', this.state?.memberID);
				if (this.state?.memberID === element.memberID) memberJoined = true;
			});
			return (
				<table className="RideEntry">
					<tbody>
						<tr>
							<td className="RideEntryName">
								{this.state.user.firstname + ' ' + this.state.user.lastname}
							</td>
							<this.showDate />
						</tr>
						<tr>
							<td>
								<ul className="RideEntryField">
									<li className="RideEntryField">
										Pickup: {this.props.departure}
									</li>
									<li className="RideEntryField">
										Drop-off: {this.props.destination}
									</li>
								</ul>
							</td>
							<this.showPrice />
						</tr>
						<tr>
							<td>
								<p className="RideEntryFieldNumber">
									{this.props.numberOfSeats}
								</p>
							</td>
							{this.state.shouldShowJoin && <td>
                               
								<button
									type="submit"
									className={
										!this.props.numberOfSeats || memberJoined
											? 'disableBtn'
											: 'btn'
									}
									onClick={this.handleclick}
								>
									Join
								</button>
							</td>}
							<this.showButton />
						</tr>
					</tbody>
				</table>
			);
		}
	}
}

export default RideEntry;
