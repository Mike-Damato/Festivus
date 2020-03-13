const admin = require('firebase-admin');
const express = require('express');
const app = express();
const firebase = require('firebase');
const db = admin.firestore();

const FBAuth = async (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return res.status(403).send({ error: 'Unauhtorized' });
  }

  let foundToken = await admin.auth().verifyIdToken(idToken);
  req.user = foundToken;
  return db.collection('users').where('userId', '==', req.user.uid);
};
