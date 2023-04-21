import React, { Component } from 'react';

class Feedback extends Component {
	constructor(props) {
		super(props);

		this.state = {
			userID: '',
			username: '',
			emailID: '',

			loggedIn: false,
			driverID: JSON.parse(localStorage.getItem('driverID')),

			driverName: '',
			message: '',
			// submitted: false,
			stars: 0, // added rating state variable with default value 0
		};

		// this.getDriverName = this.getDriverName.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleStarClick = this.handleStarClick.bind(this);
		this.handleChange = this.handleChange.bind(this);

		this.signedInUser();
		this.getDriverName();
	}

	signedInUser() {
		const uri = `http://localhost:${process.env.PORT}/user/checktoken`;

		const self = this;

		fetch(uri, {
			method: 'POST',
		})
			.then(function (response) {
				// Check if login worked. If not, then show not logged in.
				if (response.status == 404 || response.status == 401) {
					self.setState({
						loggedIn: false,
					});
				} else {
					self.setState({
						loggedIn: true,
					});
				}
				return response.json();
			})
			.then(function (signinResult) {
				// If there is a user signed in, populate the fisrt and last name fields.
				if (signinResult.success) {
					self.setState({
						userID: signinResult.founduser._id,
						emailID: signinResult.founduser.emailID,
						username: signinResult.founduser.username,
					});
				}
			})
			.catch(function (err) {
				console.log('Request failed', err);
			});
	}

	getDriverName() {
		console.log('getting driver name', this.state.driverID);
		var uri = `http://localhost:${process.env.PORT}/user/${this.state.driverID}`;
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
				self.setState({
					driverName: data.username,
				});

				console.log('driverName', this.state.driverName);
			});
	}

	handleSubmit(event) {
		event.preventDefault();

		console.log('clicked on submit feedback');

		console.log(this.state);

		const uri = `http://localhost:${process.env.PORT}/user/addFeedback`;

		const body = JSON.stringify(this.state);

		fetch(uri, {
			method: 'POST',
			body: body,
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				if (response.status === 200) {
					this.setState({
						submitted: true,
					});

					console.log('feedback added');
				} else {
					console.log('feedback not added', response);
				}
			})
			.catch(function (err) {
				console.log('Request failed: ', err);
			});
	}

	handleChange(event) {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState({
			[name]: value,
		});
	}

	handleStarClick(star) {
		this.setState({ stars: star });
		console.log('stars: ', this.state.stars);
	}

	render() {
		// const stars = this.state.stars;
		console.log(this.state.emailID);
		console.log(this.state.userID);
		console.log(this.state.username);
		console.log(this.state.driverName);
		return (
			<div>
				<form className="FeedbackForm" onSubmit={this.handleSubmit}>
					<label className="FeedbackFormInput">User name</label>
					<input
						type="text"
						name="username"
						value={this.state.username}
						readOnly
					/>

					<label className="FeedbackFormInput">Email Address</label>
					<input
						type="text"
						name="emailID"
						value={this.state.emailID}
						readOnly
					/>
					<label className="FeedbackFormInput">To driver</label>
					<input
						type="text"
						name="driverName"
						value={this.state.driverName}
						readOnly
					/>
					<label className="FeedbackFormInput">Message</label>
					<input
						type="text"
						name="message"
						value={this.state.message}
						onChange={this.handleChange}
					/>
					<div style={{ cursor: 'pointer' }}>
						{[1, 2, 3, 4, 5].map((star) => (
							<span key={star} onClick={() => this.handleStarClick(star)}>
								{star <= this.state.stars ? '★' : '☆'}
							</span>
						))}
					</div>
					<input type="submit" value="Submit" />
				</form>
			</div>
		);
	}
}
export default Feedback;
