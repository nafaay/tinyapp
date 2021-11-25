/**
 *  given the email and database return
 *  the user if exists otherwise return null;
 */

const getUserByEmail = function (email, database) {
  const user = {};
  for (const key in database) {
    if (email === database[key].email) {
      user.id = database[key].id;
      user.email = database[key].email;
      user.password = database[key].password;
      return user;
    }
  }
  return undefined;
}

/**
 *  given the id from the cookie session 
 *  the user if exists otherwise return null;
 */

const getUserById = function (id, database) {
  const user = {};
  for (const key in database) {
    if (id === database[key].id) {
      user.id = database[key].id;
      user.email = database[key].email;
      user.password = database[key].password;
      return user;
    }
  }
  return null;
}

/**
 * given the user id and urlDatabase return the shortURL
 * with its longURL'(s) if not return null
*/

const urlsForUser = function (id, urlDatabase) {
  const objUrlsUser = {};
  for (const key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === id) {
      const shortURL = key;
      const longURL = urlDatabase[key].longURL;
      objUrlsUser[shortURL] = longURL;
    }
  }
  return objUrlsUser;
};

/**
 * check if the email entered by the user is always
 * in databse of users (here object users)
 */
const checkEmailAlreadyExists = function (email, database) {
  for (const keys of Object.keys(database)) {
    if (database[keys]['email'] === email) {
      return true;
    }
  }
  return false;
};

/**
 * This function will create a random
 * alphanumeric string to simulate generating a shortURL
 */
const generateRandomString = function () {
  let str = ""; // will contain the final random 6 alphanum chars
  let rd;       // get number between 0 and 9, or number between 65 and 90
  // or number between 97 and 122 to simulate numbers, uppercase and
  // lowecase characters
  let chx;      // get a number between 0 and 2
  for (let i = 1; i <= 6; i++) {
    chx = getRndInteger(0, 3);
    if (chx === 0) {
      // We use Math.floor to get only integers
      rd = getRndInteger(0, 10); // number between 0 and 9
      str += rd;
    } else if (chx === 1) {
      rd = getRndInteger(65, 91);
      // method will convert Unicode values to characters
      str += String.fromCharCode(rd); // uppercase char
    } else if (chx === 2) {
      rd = getRndInteger(97, 123);
      str += String.fromCharCode(rd); // lowecase char
    }
  }
  return str.trim();
};

const getRndInteger = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

const urlDoesNotExist = function (resp) {
  resp
    .status(403)
    .send(`this URL does not exist . Please <a href='/urls'> return`);
}

const youHaveNoRights = function (resp) {
  resp
    .status(403)
    .send("You do not have the rights to see this URL");
}

const emailAndOrPasswordDoNotMatch = function (resp) {
  return resp
    .status(403)
    .send(`email and/or password do/does not match. Please <a href='/login'> try again</a>`);
}

const zonesEmpty = function (resp) {
  return resp
    .status(403)
    .send(`email or password is missing. Please <a href='/register'> Fill in empty areas</a>`);
}

const emailAlreadyExists = function (resp) {
  return resp
    .status(403)
    .send(`This email alrady exists". Please <a href='/register'> try another one</a>`);
}

const missingEmailAndOrPassword = function (resp) {
  return resp
    .status(403)
    .send(`email and/or password are missing". Please <a href='/register'> Fill in empty areas</a>`);
}

module.exports = { 
  getUserByEmail, 
  getUserById, 
  urlsForUser, 
  generateRandomString, 
  checkEmailAlreadyExists,
  urlDoesNotExist,
  youHaveNoRights,
  emailAndOrPasswordDoNotMatch,
  zonesEmpty,
  emailAlreadyExists,
  missingEmailAndOrPassword
};
