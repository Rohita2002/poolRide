import React, { Component } from 'react';

/**
 * The about page.
 */
export default class ViewUsers extends Component {
	constructor(props) {
		super(props);

		this.state = {
			Users: [],
		};

		this.getAllUsers = this.getAllUsers.bind(this);
		this.handleDelete = this.handleDelete.bind(this);

		this.getAllUsers();
	}

	getAllUsers() {
		const uri = `https://poolnride-api.onrender.com/user/allusers`;

		// Get user id and send it in with the post request.

		self = this;
		// const arr = [];

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
					Users: arr,
				});
				console.log('data', data);
				console.log('users in getting', Users);
			});
	}

	handleDelete(id) {
		console.log('user to be deleted:', id);

		const uri = `https://poolnride-api.onrender.com/user/${id}`;

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

	render() {
		console.log('users in main', this.state.Users);

		return (
			<div>
				<table>
					<thead>
						<tr>
							<th>Serial No.</th>
							<th>First Name</th>
							<th>Email</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{this.state.Users?.map((user, index) => (
							<tr key={user._id}>
								<td>{index + 1}</td>
								<td>{user.firstname}</td>
								<td>{user.emailID}</td>
								<td>
									<button onClick={() => this.handleDelete(user._id)}>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}
