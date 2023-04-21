import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Route,
	Link,
	NavLink,
} from 'react-router-dom';
// import * as bcrypt from 'bcrypt';

import Listings from './Listings.jsx';
import NewRide from './NewRide.jsx';
import Register from './Register.jsx';
import About from './About.jsx';
import Login from './Login.jsx';
import LogOut from './LogOut.jsx';
import MyAccount from './MyAccount.jsx';
import DropdownMenu from './DropdownMenu.jsx';
import EditRide from './EditRide.jsx';
import Admin from './Admin.jsx';
import ViewPools from './ViewPools.jsx';
import ViewUsers from './ViewUsers.jsx';
import Landing from './Landing.jsx';
import Payment from './Payment.jsx';
import Feedback from './Feedback.jsx';

import '../css/App.css';

const tractor = require('../images/tractor-72-194019.png');

/**
 * Main app entrypoint for React.
 */
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			emailID: '',
			password: '',
			isUserSignedIn: false,
			screenWidth: window.innerWidth,
			screenHeight: window.innerHeight,
			isAdmin: false,
		};

		this.updateWidth = this.updateWidth.bind(this);
	}

	componentDidMount() {
		this.signedInUser();
		window.addEventListener('resize', this.updateWidth);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateWidth);
	}

	updateWidth() {
		this.setState({
			screenWidth: window.innerWidth,
		});
	}

	/**
	 * See if user is signed in.
	 */
	signedInUser() {
		const uri = `http://localhost:${process.env.PORT}/user/checktoken`;

		const self = this;

		fetch(uri, {
			method: 'POST',
		})
			.then(function (response) {
				// set firstname and lastname here in self.setstate
				if (response.ok && response.status == 200) {
					console.log('do something here');
					// const user = response.json().founduser;
					console.log('user :>> ', response);
					// if (user.emailID === "admin@gamil.com" && user.password === "admin") {
					//   self.setState((state) => ({
					//     isAdmin: true,
					//   }));
					// }
					self.setState((state) => ({
						isUserSignedIn: true,
					}));
					// return response.json();
				} else if (response.status == 401) {
					console.log('user not logged in');
					self.setState((state) => ({
						isUserSignedIn: false,
						isAdmin: false,
					}));
				} else if (response.status == 404) {
					console.log('user does not exist');
					self.setState((state) => ({
						isUserSignedIn: false,
					}));
				}
				return response.json();
			})
			.then(async function (jsonresponse) {
				const user = jsonresponse.founduser;
				// const isPassword = await bcrypt.compare('admin', user.password.toString());
				console.log('user.emailID :>> ', user.emailID);
				if (user.emailID === 'admin@gmail.com') {
					console.log('is admin.......');
					self.setState({
						isAdmin: true,
					});
				}
				console.log('json response', jsonresponse);
			})
			.catch(function (err) {
				console.log('Request failed', err);
			});
	}

	render() {
		var navbarItem = !this.state.isAdmin ? (
			<div>
				<NavLink
					className="menuOption"
					to="/about"
					hidden={this.state.isUserSignedIn}
				>
					About me
				</NavLink>
				<NavLink
					className="menuOption"
					to="/myaccount"
					hidden={!this.state.isUserSignedIn}
				>
					My Account
				</NavLink>
				<NavLink
					className="menuOption"
					to="/newRide"
					hidden={!this.state.isUserSignedIn}
				>
					New Ride
				</NavLink>
				<NavLink
					className="menuOption"
					to="/register"
					hidden={this.state.isUserSignedIn}
				>
					Sign up
				</NavLink>
				<NavLink
					className="menuOption"
					to="/login"
					hidden={this.state.isUserSignedIn}
				>
					Log in
				</NavLink>
				<NavLink
					className="menuOption"
					to="/logout"
					hidden={!this.state.isUserSignedIn}
				>
					Log out
				</NavLink>
			</div>
		) : (
			<div>
				<NavLink className="menuOption" to="/viewusers">
					View Users
				</NavLink>
				<NavLink className="menuOption" to="/viewpools">
					View Pools
				</NavLink>
				<NavLink className="menuOption" to="/admin">
					Generate Report
				</NavLink>
				<NavLink
					className="menuOption"
					to="/login"
					hidden={this.state.isUserSignedIn}
				>
					Log in
				</NavLink>
				<NavLink
					className="menuOption"
					to="/logout"
					hidden={!this.state.isUserSignedIn}
				>
					Log out
				</NavLink>
			</div>
		);

		return (
			<Router>
				<div className="App">
					<div className="App-header">
						{this.state.isUserSignedIn && (
							<Link to="/homeuser">
								<img id="logo" src={tractor} className="App-logo" alt="logo" />
							</Link>
						)}
						{!this.state.isUserSignedIn && (
							<Link to="/">
								<img id="logo" src={tractor} className="App-logo" alt="logo" />
							</Link>
						)}
						<h2>Pool&Ride</h2>
						<DropdownMenu
							width={this.state.screenWidth}
							isUserSignedIn={this.state.isUserSignedIn}
						/>
						<div className="mainMenu" hidden={this.state.screenWidth <= 415}>
							{navbarItem}
						</div>
					</div>
					<Route exact path="/" component={Landing} />
					<Route path="/admin" component={Admin} />
					<Route path="/homeuser" component={Listings} />
					<Route path="/newRide" component={NewRide} />
					<Route path="/register" component={Register} />
					<Route path="/about" component={About} />
					<Route path="/login" component={Login} />
					<Route path="/logout" component={LogOut} />
					<Route path="/myaccount" component={MyAccount} />
					<Route path="/editride" component={EditRide} />
					<Route path="/viewpools" component={ViewPools} />
					<Route path="/viewusers" component={ViewUsers} />
					<Route path="/payment" component={Payment} />
					<Route path="/feedback" component={Feedback} />
				</div>
				<link
					href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap"
					rel="stylesheet"
				></link>
			</Router>
		);
	}
}

export default App;
