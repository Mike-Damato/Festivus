const admin = require('firebase-admin');

module.exports = async (req, res, next) => {
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

exports.validateSignupData = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'Must not be empty';
  }

  if (isEmpty(data.password)) {
    errors.password = 'Must not be empty';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassWord = 'Passwords must match';
  }

  if (isEmpty(data.userName)) {
    errors.password = 'Must not be empty';
  }
  return { errors, valid: Object.keys(errors).length === 0 ? true : false };
};

exports.validateLogInData = data => {
  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = 'Must not be empty';
  }
  if (isEmpty(user.password)) {
    errors.password = 'Must not be empty';
  }
  return { errors, valid: Object.keys(errors).length === 0 ? true : false };
};
