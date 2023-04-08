import React, { Component, useState } from 'react';
import { Redirect } from 'react-router-dom';

import "react-datepicker/dist/react-datepicker.css";
import request from 'request';

/**
 * Page for editing a ride entry.
 */
class RegisterVehicle extends Component {
   
    // @TODO change this so that as prop only the ride id is passed in; other info can be extracted from there.
    constructor(props) {
        super(props);
        this.state = {
            // userID: this.props.location.state.userID,
            firstname: '',
            lastname: '',
            username: '',
            emailID: this.props.location.state.emailID,
            mobileNumber: '',
            password: '',
            cpassword: '',
            vehicleType: '',
            vehicleRegNum: '',
            vehicleSpecification: '',
            licenseID: '',

            loggedin: true,
            submitted: false,
            showForm: false // initialize state for showing/hiding the form
        };

        this.getUserByEmailID();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        // Check for active token. If not, then prompt user to sign in or register.
    }

    toggleForm() {
        this.setState({ showForm: !this.state.showForm }); // toggle the state when the toggle button is clicked
    }

    /**
     * See if user is signed in. If so, open the edit ride form. If not, prompt them to sign in.
     */
    signedInUser() {
        const uri = `http://localhost:${process.env.PORT}/user/checktoken`;

        const self = this;

        fetch(uri, {
            method: "POST"
        }).then(function(response) {
            // Check if login worked. If not, then show not logged in. 
            if (response.status == 404 || 
                response.status == 401) {
                    self.setState(() => ({
                        loggedin: false
                    }));
            }
            return response.json();
        }).then(function(signinResult) {
            // If there is a user signed in, populate the first and last name fields.
            if(signinResult.success) {
                if (signinResult.founduser._id !== self.state.driverID) {
                    console.log('logged in user is not driver of this ride');
                    self.setState(() => ({
                        loggedin: false
                    }));
                } else {
                    self.setState(() => ({
                        firstname: signinResult.founduser.firstname,
                        lastname: signinResult.founduser.lastname
                    }));
                }
            }
        }).catch(function(err) {
            console.log('Request failed', err);
        });
    }

    getUserByEmailID() {
        var uri = `http://localhost:${process.env.PORT}/user/${this.state.emailID}`;
        self = this;
        request.get(uri, function (error, response, body) {
            // Print the error if one occurred
            if (error) {
                console.error('error:', error); 
            }
            // Print the response status code if a response was received
            console.log('statusCode:', response && response.statusCode); 
            // Print the HTML for all rides query.
            console.log('body:', body); 

            const user = JSON.parse(body);

            //const currentDate = new Date(ride.date);

            self.setState({
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                mobileNumber: user.mobileNumber,
                password: user.password,

                // category: ride.category,
                // departure: ride.departure,
                // destination: ride.destination,
                // price: ride.price,
                // numberOfSeats: ride.numberOfSeats,
                // date: currentDate,
                // driverID: ride.driverID
            }, () => {
                self.signedInUser();
            });

            console.log(user);
        });
    }

    

    toggleForm() {
        setShowForm(!showForm); // toggle the state when the toggle button is clicked
    }

    /**
     * Update state when values are changed.
     * @param {} event 
     */
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    /**
     * Handle the form submit by creating a post request.
     */
    handleSubmit(event) {
        event.preventDefault();
        // Make the put request
        const uri = `http://localhost:${process.env.PORT}/user/${this.state.emailID}`;

        const formdata = JSON.stringify(this.state);
        self = this;

        fetch(uri, {
            method: "PUT",
            body: formdata,
            headers: {
            "Content-Type": "application/json"
            }
        }).then(function(response) {
            self.setState({
                submitted: true
            });
            return response.json();
        }).catch(function(err) {
            console.log('Request failed', err);
        });
    }

    /**
     * A form for entering input to edit a ride entry in the database.
     */
    render() {
        console.log('this.state.loggedin: ', this.state.loggedin)
        if (!this.state.loggedin) {
            return (
                <Redirect to="/login"/>
            );
        }

        if (this.state.submitted) {
            return (
                <Redirect to="/myaccount" />
            )
        }
        return (
            <div className="UserAccountContainer">
                <h1 className="formInput">Edit Profile</h1>
                {/* <this.Errors /> */}
                <form className="UserAccountForm" onSubmit={this.handleSubmit}>
                    <label className="UserAccountFormInput">First name</label>
                    <input type="text" name="firstname" value={this.state.firstname} onChange={this.handleChange} />

                    <label className="UserAccountFormInput">Last name</label>
                    <input type="text" name="lastname" value={this.state.lastname} onChange={this.handleChange} />

                    <label className="UserAccountFormInput">User name</label>
                    <input type="text" name="username" value={this.state.username} onChange={this.handleChange} />

                    <label className="UserAccountFormInput">Email Address</label>
                    <input type="text" name="emailID" value={this.state.emailID} onChange={this.handleChange} />

                    <label className="UserAccountFormInput">Mobile Number</label>
                    <input type="text" name="mobileNumber" value={this.state.mobileNumber} onChange={this.handleChange} />

                    <label className="UserAccountFormInput">Password</label>
                    <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />

                    <label className="UserAccountFormInput">Confirm Password</label>
                    <input type="password" name="cpassword" value={this.state.cpassword} onChange={this.handleChange} />

                    
                    <label>
                        <input type="checkbox" checked={this.state.showForm} onChange={this.toggleForm} />{" "} Have a Vehicle?
                    </label>

                    {this.state.showForm && ( // only show the form if showForm is true
                        <div>
                        <form>
                            <label className="UserAccountFormInput">Vehicle Type</label>
                            <input type="text" name="vehicleType" value={this.state.vehicleType} onChange={this.handleChange} />

                            <label className="UserAccountFormInput">Vehicle Registration Number</label>
                            <input type="text" name="vehicleRegNum" value={this.state.vehicleRegNum} onChange={this.handleChange} />
                            
                            <label className="UserAccountFormInput">Vehicle Specification</label>
                            <input type="text" name="vehicleSpecification" value={this.state.vehicleSpecification} onChange={this.handleChange} />
                            
                            <label className="UserAccountFormInput">License ID</label>
                            <input type="text" name="licenseID" value={this.state.licenseID} onChange={this.handleChange} />
                        </form>
                        </div>
                    )}
                    
                    <input className="UserAccountFormInput" type="submit" value="Submit"/>
                </form>
            </div>
        );
    }
}

export default RegisterVehicle;
