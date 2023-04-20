import React, { Component } from 'react';

import RideEntry from './RideEntry.jsx';

/**
 * Populate ride objects in to the listing page.
 */
class DynamicRides extends Component {
	constructor(props) {
		super(props);

		this.RidesByDate = this.RidesByDate.bind(this);
	}

	/**
	 * Prepare cards of rides to render.
	 */
	RidesByDate() {
		let rideGroups = [];
		if (this.props.rides.length > 0) {
			for (let ride of this.props.rides) {
				if (!ride.completed) {
					rideGroups.push(
						<RideEntry
							key={ride.key}
							rideID={ride._id}
							driverID={ride.driverID}
							departure={ride.departure}
							destination={ride.destination}
							date={ride.date}
							completed={ride.completed}
							numberOfSeats={ride.numberOfSeats - ride.poolMembers?.length}
							price={ride.price}
							shouldShowEdit={this.props.shouldShowEdit}
							shouldShowJoin={this.props.shouldShowJoin}
							shouldShowDelete={this.props.shouldShowDelete}
							shouldShowComplete={this.props.shouldShowComplete}
							poolMembers={ride.poolMembers}
						/>
					);
				}
			}
			return rideGroups;
		} else {
			return <div id="NoRides">No rides yet!</div>;
		}
	}

	render() {
		return (
			<div>
				<this.RidesByDate />
			</div>
		);
	}
}

export default DynamicRides;
