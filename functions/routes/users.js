const { db } = require('../admin.js');
const firebase = require('firebase');
const { validateSignupData, validateLoginData } = require('../valitdation.js');
const firebaseConfig = require('../config');
firebase.initializeApp(firebaseConfig);

exports.signup = async (req, res, next) => {
  try {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      userName: req.body.userName
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) {
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
};

exports.login = async (req, res, next) => {
  try {
    const user = {
      email: req.body.email,
      password: req.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if (!valid) {
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
};
