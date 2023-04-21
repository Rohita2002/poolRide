import React, { Component } from 'react';

class Feedback extends Component {
	constructor(props) {
		super(props);

		this.state = {
			userID: '',
			username: '',
			emailID: '',

			loggedIn: false,
			driverID: this.props.driverID,

			driverName: '',
			feedback: '',
			submitted: false,
			stars: 0, // added rating state variable with default value 0
		};

		this.getDriverName = this.getDriverName.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleStarClick = this.handleStarClick.bind(this);
		this.handleChange = this.handleChange.bind(this);

		this.signedInUser();
	}

	async signedInUser() {
		const uri = `http://localhost:${process.env.PORT}/user/checktoken`;

		const self = this;

		await fetch(uri, {
			method: 'POST',
		})
			.then(function (response) {
				// Check if login worked. If not, then show not logged in.
				if (response.status == 404 || response.status == 401) {
					self.setState((state) => ({
						loggedin: false,
					}));
				}
				return response.json();
			})
			.then(function (signinResult) {
				// If there is a user signed in, populate the fisrt and last name fields.
				if (signinResult.success) {
					self.setState((state) => ({
						userID: signinResult.founduser._id,
						emailID: signinResult.founduser.emailID,
						username: signinResult.founduser.username,
					}));
				}
			})
			.catch(function (err) {
				console.log('Request failed', err);
			});
	}

	async getDriverName() {
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

		//? add accorind to backend
		const uri = `http://localhost:${process.env.PORT}/user/${this.state.driverID}`;

		const feedback = JSON.stringify(this.state);
		self = this;

		fetch(uri, {
			method: 'PUT',
			body: feedback,
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(function (response) {
				self.setState({
					submitted: true,
				});
				return response.json();
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
		const stars = this.state.stars;
		return (
			<div>
				<form className="FeedbackForm" onSubmit={this.handleSubmit}>
					<label className="FeedbackFormInput">User name</label>
					<input
						type="text"
						name="username"
						value={this.state.username}
						onChange={this.handleChange}
					/>

					<label className="FeedbackFormInput">Email Address</label>
					<input
						type="text"
						name="emailID"
						value={this.state.emailID}
						onChange={this.handleChange}
					/>
					<label className="FeedbackFormInput">To driver</label>
					<input
						type="text"
						name="driverName"
						value={this.state.driverName}
						onChange={this.handleChange}
					/>
					<label className="FeedbackFormInput">feedback</label>
					<input
						type="text"
						name="feedback"
						value={this.state.feedback}
						onChange={this.handleChange}
					/>
					<div style={{ cursor: 'pointer' }}>
						{[1, 2, 3, 4, 5].map((star) => (
							<span key={star} onClick={() => this.handleStarClick(star)}>
								{star <= stars ? '★' : '☆'}
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
