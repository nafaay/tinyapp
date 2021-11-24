/**@author: Youssef Nafaa < nafaayoussef@gmail.com>
 * @project: tinyapp for bootcamp at lighthouse lab Canada
 * @date: November 2021

/**
 * Using express to communicate between client and server
 */
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
/**
 * to use cookies
 */
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

/**
 *  to encrypt passwords
 */
const bcrypt = require('bcryptjs');

/**
 * Set ejs as the view engine
 */
app.set("view engine", "ejs");
app.use(morgan('dev'));
/**
 * bodyParser is a middleware that will help us
 * to read data buffer when using POST requests
 */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Object simulating a database of urls to work on.
 */
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

/**
 * Object simulating a database of users.
 * each user id is an object of {id, email, password}
 */
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    // password: "purple-monkey-dinosaur"
    // here we encrypt password like that just to be able to make comparison
    // when the user enters one, in real world the passwords are encrypted
    // on the registartion and savec encrypted in the database
     password: bcrypt.hashSync("123", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    // password: "dishwasher-funk"
    password: bcrypt.hashSync("456", 10)
  }
};

/**
 *  given the email from return
 *  the user if exists otherwise return null;
 */

const getUserByEmail = function(email){
  const user = {};

  for(const key in users){
    if(email === users[key].email){
      user.id = users[key].id;
      user.email = users[key].email;
      user.password = users[key].password;
      console.log(user)
      return user;
    }
  }
  return null;
}

/**
 *  given the id from the cookie session 
 *  the user if exists otherwise return null;
 */

const getUserById = function (id) {
  const user = {};
  for (const key in users) {
    if (id === users[key].id) {
      user.id = users[key].id;
      user.email = users[key].email;
      user.password = users[key].password;
      console.log(user)
      return user;
    }
  }
  return null;
}


const getUserID = function (email, password) {
  for (const key of Object.keys(users)) {
    if (users[key]['email'] === email && users[key]['password'] === password) {
      return key;
    }
  }
  return null;
};
///////////////////////////////////////////////

/**
 * given the user id return the shortURL
 * with its longURL'(s) and userID if not return null
 */

const getUrlsOfUserIfExist = function (userID) {
  const objUrlsUser = {};
  for (const key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === userID) {
      const shortURL = key;
      const longURL = urlDatabase[key].longURL;
      objUrlsUser[shortURL] = longURL;
    }
  }
  return objUrlsUser;
};
///////////////////////////////////////////////

/**
 * return a valid user if exists if not return null
 */
const checkIfUserExists = function (userID) {
  let user = {};
  if (users.hasOwnProperty(userID)) {
    const email = users[userID].email;
    const password = users[userID].password;
    user = { userID, email, password };
  } else {
    user = null;
  }
  return user;
};

/**
 * check if the email entered by the user is always
 * in databse of users (here object users)
 */
const checkEmailAlreadyExists = function (email) {
  for (const keys of Object.keys(users)) {
    if (users[keys]['email'] === email) {
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
  let str = "";// will contain the final random 6 alphanum chars
  let rd; // get number between 0 and 9, or number between 65 and 90
  // or number between 97 and 122 to simulate numbers, uppercase and
  // lowecase characters
  let chx; // get a number between 0 and 2
  for (let i = 1; i <= 6; i++) {
    chx = getRndInteger(0, 3);
    if (chx === 0) {
      // We use Math.floor because to get only integers
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

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  // const userID = req.session.userID;
  const user = checkIfUserExists(userID);
  if (!user) {
    res.redirect("/login");
  }
  else{
    res.redirect("/urls");
  }
  // const urlsOfUser = getUrlsOfUserIfExist(userID);
  // const templateVars = {
  //   user, urls: urlsOfUser
  // };

  // res.render("urls_index", templateVars);
});


/**
 * Showing list of urls via the template urls_index
 */
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  // get the user if he exists or null if not
  let user = null;
  let urls = null;
  if (user_id) {
    user = getUserById(user_id);
    urls = getUrlsOfUserIfExist(user.id);
  }
  // template to be sent to urls_index if user exists 
  // if not redirect to login
  const templateVars = {
    user, urls
  };
  if (user) {
    res.render("urls_index", templateVars);
  }
  else {
    res.render('login', templateVars);
  }
});

/**
 * Route to logout
 */
app.post("/logout", (req, res) => {
  // if the user logs out we destroy the cookie session
  req.session = null;
  res.redirect("/urls");
});

/**
 * Route to POST register
 */
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Ask the user to fill in the empty zones.
  if (!email || !password) {
    return res
      .status(403)
      .send(`email or password is missing". Please <a href='/register'> Fill in empty areas</a>`);
  }

  if (checkEmailAlreadyExists(email)) {
    return res.status(403).send(`This email alrady exists". Please <a href='/register'> try another one</a>`);
  }
  const userID1 = generateRandomString();
  const userID2 = generateRandomString();
  const userID = userID1 + userID2;
  // we hash the password once the user registers
  bcrypt.hash(password, 10, (err, hash) => {
    // Store hash in your password DB.
    const user = { userID, email, hash };
    users[userID] = user;
    req.session.user_id = userID;
    res.redirect('/urls');
  });
});

/**
 * Route to GET login
 */
app.get("/login", (req, res) => {

  // get user_id from the cookie session if it exists
  const user_id = req.session.user_id;
  // get the user if he exists or null if not
  let user = null;
  let urls = null;
  if(user_id){
    user = getUserById(user_id);
    urls = getUrlsOfUserIfExist(user.id);
  }
  const templateVars = {
    user, urls
  };
  if (user){
    res.redirect('/urls');
  }
  else{
    res.render('login', templateVars);
  }
});

/**
 * Route to POST login
 */
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Ask the user to fill in the empty zones.
  if (!email || !password) {
    return res.status(403).send(`email or password is missing". Please <a href='/register'> Fill in empty areas</a>`);
  }
  const user = getUserByEmail(email);
  if(user){
     bcrypt.compare(password, user.password, (err, result) =>{
        if (result) {
          // the email and password match ==> set cookie session and redirect
          req.session.user_id = user.id;
          res.redirect('/urls');
        }
        else{
          return res.status(403).send(`email or password does not match". Please <a href='/login'> try again</a>`);
        }
     });
  }
  else{
      return res.status(403).send(`email or password does not match". Please <a href='/login'> try again</a>`);
  }
});


/**
 * Route to GET register
 */
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  let user = null;
  let  urlsOfUser = null;
  if (userID) {
    user = checkIfUserExists(userID);
    urlsOfUser  = getUrlsOfUserIfExist(userID);
  }
  const templateVars = {
    user, urls: urlsOfUser
  };
  if (!user) {
    res.render('register', templateVars);
  }

  res.redirect('/urls');
});



/**
 * POST request from the Form Submission to create a longURL
 */
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = checkIfUserExists(userID);
  if (!user) {
    res.status(403).send("Not Authorized");
  }

  // Create a random shortURL
  const shortURL = generateRandomString();
  // Add key: value ("shortURL": "longURL") to the object
  if (req.body.longURL.trim() === "") {
    res.send("Must be not empty");
  }

  const longURL = req.body.longURL;
  const userUrl = { longURL, userID };
  urlDatabase[shortURL] = userUrl;
  // redirect shortURL to see its longURL
  res.redirect(`/urls/${shortURL}`);
});

/**
 * Handle the POST request to delete a URL from the Object
 */
app.post("/urls/:shortURL/delete", (req, res) => {
  // here we don't use req.body because we get data from a link
  // not input
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  if (!longURL) {
    return res.status(404).send(`The url ${shortURL} does not exist`);
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

/**
 * GET route to show the form to create an URL
 * Attention: This must be above any specific route (/urls/:id)
 * If not Express will think that /new is a specific route like
 * /:shortURL
 */
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = checkIfUserExists(userID);
  if (!user) {
    res.status(403).send("Not Authorized");
  }
  const templateVars = {
    user, urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

/**
 * Render information about a single URL
   shortURL is from the page, we can get it from req.params
   longURL is the value for this shortURL from urlDatabase(key)
 */
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = checkIfUserExists(userID);
  const shortURL = req.params.shortURL;
  let longURL;
  if (!user) {
    res.status(403).send("Not Authorized");
  }
  else{
    // check if shortURL belongs to this user
    if (urlDatabase[shortURL]){
      if (urlDatabase[shortURL].userID === userID) {
        longURL = urlDatabase[shortURL].longURL;
        const templateVars = {
          user, shortURL, longURL
        };
        res.render("urls_show", templateVars);
      }
      else {
        res.status(403).send("You do not have the rights to see this URL");
      }
    }
    else{
      res.status(403).send(`this URL does not exist . Please <a href='/urls'> return`);
    }
  }
});


/**
 * read the object and if we find the key: value
 * shortURL: longURL we edit longURL with the one given
 * by the user
 */
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]['longURL'] = longURL;
  res.redirect("/urls");
});


/**
 * we can here see the website of longURL if we click on shortURL
 * Redirect any request to "/u/:shortURL" to its longURL
*/
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    return res.status(404).send(`The url ${shortURL} does not exist`);
  } else {
    const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  }
});

/**
 * Listen on provided port
 */
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});