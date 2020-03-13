const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const firebase = require('firebase');
const firebaseConfig = {
  apiKey: 'AIzaSyAmaF2w79FzPUnR-tdU-f_HhkBtGbzO7RM',
  authDomain: 'whatareyourthoughts-c89d7.firebaseapp.com',
  databaseURL: 'https://whatareyourthoughts-c89d7.firebaseio.com',
  projectId: 'whatareyourthoughts-c89d7',
  storageBucket: 'whatareyourthoughts-c89d7.appspot.com',
  messagingSenderId: '282910320753',
  appId: '1:282910320753:web:da7eb3e6419e30622593d0',
  measurementId: 'G-RTZ0CZ81P2'
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
admin.initializeApp();

const db = admin.firestore();

//Helper functions
const isEmpty = str => {
  if (str.trim() === '') {
    return true;
  } else {
    return false;
  }
};

// const isEmail = email => {
//   const emailRegEx = '^([a-zA-Z0-9_-.]+)@([a-zA-Z0-9_-.]+).([a-zA-Z]{2,5})$';
//   if (email.match(emailRegEx)) {
//     return true;
//   } else {
//     return false;
//   }
// };

//===== End helper functions

//Middleware

const FBAuth = async (req, res, next) => {
  try {
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
      console.error('No token found');
      return res.status(403).send({ error: 'No token found' });
    }

    let foundToken = await admin.auth().verifyIdToken(idToken);
    req.user = foundToken;
    const data = await db
      .collection('users')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get();
    req.user.userName = data.docs[0].data().userName;
    return next();
  } catch (error) {
    console.error('Error while verifying token', error);
    return res.status(403).json(error);
  }
};

//========End Middleware

//Sign Up
app.post('/signup', async (req, res, next) => {
  try {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      userName: req.body.userName
    };

    let errors = {};

    if (isEmpty(newUser.email)) {
      errors.email = 'Must not be empty';
    }

    if (isEmpty(newUser.password)) {
      errors.password = 'Must not be empty';
    }

    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassWord = 'Passwords must match';
    }

    if (isEmpty(newUser.userName)) {
      errors.password = 'Must not be empty';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const doc = await db.doc(`/users/${newUser.userName}`).get();
    if (doc.exists) {
      return res
        .status(400)
        .json({ userName: 'This username is already taken.' });
    } else {
      const data = await firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);
      const token = await data.user.getIdToken();
      const userCredentials = {
        userName: newUser.userName,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: data.user.uid
      };
      await db.doc(`/users/${newUser.userName}`).set(userCredentials);
      return res.status(201).json({ token });
    }
  } catch (error) {
    console.error('ERROR signing up', error);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(400).json({ email: 'e-mail is already in use' });
    } else {
      res.status(500).json({ error: error.code });
    }
  }
});

//Login
app.post('/login', async (req, res, next) => {
  try {
    const user = {
      email: req.body.email,
      password: req.body.password
    };

    let errors = {};

    if (isEmpty(user.email)) {
      errors.email = 'Must not be empty';
    }
    if (isEmpty(user.password)) {
      errors.password = 'Must not be empty';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const data = await firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password);
    const token = await data.user.getIdToken();
    return res.json({ token });
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/wrong-password') {
      return res
        .status(403)
        .json({ general: 'Wrong credentials, please try again' });
    } else {
      return res.status(500).json({ error: error.code });
    }
  }
});

//Get the documents (grievances in the context of this app)
app.get('/grievances', async (req, res, next) => {
  try {
    let grievances = [];
    const data = await db
      .collection('grievances')
      .orderBy('createdAt', 'desc')
      .get();
    data.forEach(doc => {
      grievances.push({
        grievanceId: doc.id,
        body: doc.data().body,
        userName: doc.data().userName,
        createdAt: doc.data().createdAt
      });
    });
    res.json(grievances);
  } catch (error) {
    next(error);
  }
});

//Create documents (grievances in the context of this app)
app.post('/grievance', FBAuth, async (req, res, next) => {
  try {
    if (req.method !== 'POST') {
      return res.status(400).json({ error: 'Error Method not allowed' });
    }
    const newGrievance = {
      body: req.body.body,
      userName: req.user.userName,
      createdAt: new Date().toISOString()
    };
    const doc = await db.collection('grievances').add(newGrievance);
    res.json({
      message: `document ${doc.id} has been created successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong airing a grievance' });
    next(error);
  }
});

exports.api = functions.https.onRequest(app);
