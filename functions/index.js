const functions = require('firebase-functions');
const express = require('express');
const app = express();
const { getAllGrievances, createGrievance } = require('./routes/grievances');
const { signup, login } = require('./routes/users');
const FBAuth = require('./utils');
// const { firebaseConfig } = require('../secrets');

//Middleware

//Sign Up
app.post('/signup', signup);
//Login
app.post('/login', login);

//Get the documents (grievances in the context of this app)
app.get('/grievances', getAllGrievances);
//Create documents (grievances in the context of this app)
app.post('/grievance', FBAuth, createGrievance);

exports.api = functions.https.onRequest(app);
