import React, { Component } from 'react';

/**
 * The about page.
 */
export default class About extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="AboutPage">
				<p className="AboutPage">
					Welcome to "Pool and Ride" - the ultimate platform for drivers and
					riders to share rides and save money. Our project aims to provide a
					convenient and eco-friendly solution to the daily commute by enabling
					riders to share a ride with drivers who are headed in the same
					direction. With "Pool and Ride", drivers can offer their vehicles for
					pooling, and riders can search for available rides that match their
					routes.
				</p>
				<p className="AboutPage">
					Our platform is designed to promote carpooling, reduce traffic
					congestion, and lower carbon emissions. "Pool and Ride" is not just a
					ride-sharing platform; it's a community of people who care about the
					environment, want to save money, and enjoy the social aspect of
					sharing a ride. We believe that sharing a ride is not only a practical
					solution but also a way to build connections and create new
					friendships.
				</p>
				<p className="AboutPage">
					Our mission is to make commuting more affordable, efficient, and
					enjoyable for everyone. Whether you're a driver looking to share your
					ride or a rider searching for a convenient and cost-effective way to
					get around, "Pool and Ride" has got you covered. Join our community
					today and start sharing your ride!
				</p>
			</div>
		);
	}
}
