import React, { Component } from 'react';

/**
 * The about page.
 */
export default class ViewUsers extends Component {
	constructor(props) {
		super(props);

		this.state = {
			users: null,
		};

		this.getAllUsers = this.getAllUsers.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		this.displayUsers = this.displayUsers.bind(this);

		this.getAllUsers();
	}

	getAllUsers() {
		const uri = `http://localhost:${process.env.PORT}/user/allusers`;

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
				data.forEach((user) => {
					arr.push(user);
				});
				self.setState({
					users: arr,
				});
				console.log('data', data);
				console.log('users in getting', this.state.users);
			});
	}

	handleDelete(id) {
		console.log('user to be deleted:', id);

		const uri = `http://localhost:${process.env.PORT}/user/${id}`;

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

	displayUsers() {
		console.log('users in display', this.state.users);

		return null;
	}

	render() {
		return (
			<div>
				<this.displayUsers />
			</div>
		);
	}
}
