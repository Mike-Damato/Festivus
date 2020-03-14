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

  if (isEmpty(data.email)) {
    errors.email = 'Must not be empty';
  }
  if (isEmpty(data.password)) {
    errors.password = 'Must not be empty';
  }
  return { errors, valid: Object.keys(errors).length === 0 ? true : false };
};
