/**@author: Youssef Nafaa < nafaayoussef@gmail.com>
 * @project: tinyapp for bootcamp at lighthouse lab Canada
 * @date: November 2021
**/

// helper that contains our helper functions
const { getUserByEmail, getUserById } = require('./helper');

 /**  
 * Using express to communicate between client and server
 */
const express = require("express");
const app = express();
/**
 * morgan to detect errors without killing the server each time
 */
const morgan = require("morgan");
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
 *  to be able to encrypt passwords
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
// const { response } = require("express");
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


const emailAndOrPasswordDoNotMatch = function (resp) {
  return resp
    .status(403)
    .send(`email and/or password do/does not match. Please <a href='/login'> try again</a>`);
}

const zonesEmpty = function(resp){
  return resp
    .status(403)
    .send(`email or password is missing. Please <a href='/register'> Fill in empty areas</a>`);
}

const emailAlreadyExists = function(resp){
  return resp
    .status(403)
    .send(`This email alrady exists". Please <a href='/register'> try another one</a>`);
}

const missingEmailAndOrPassword = function(resp){
  return resp
    .status(403)
    .send(`email and/or password are missing". Please <a href='/register'> Fill in empty areas</a>`);
}


/**
 * given the user id return the shortURL
 * with its longURL'(s) if not return null
*/

const urlsForUser = function (id) {
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

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  // const userID = req.session.userID;
  const user = getUserById(userID, users);
  if (!user) {
    res.redirect("/login");
  }
  else{
    res.redirect("/urls");
  }
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
    user = getUserById(user_id, users);
    urls = urlsForUser(user_id);
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
  if (email.trim() === "" || password.trim() === "") {
    zonesEmpty(res);
  }
  else if (checkEmailAlreadyExists(email)) {
    emailAlreadyExists(res);
  }
  else{
    const userID1 = generateRandomString();
    const userID2 = generateRandomString();
    const id = userID1 + userID2;
    // we hash the password once the user registers
    bcrypt.hash(password, 10, (err, hash) => {
      const user = { id, email, hash };
      users[id] = user;
      req.session.user_id = id;
      res.redirect('/urls');
    });
  }
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
    user = getUserById(user_id, users);
    urls = urlsForUser(user_id);
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
  if (email.trim() === "" || password.trim() === "") {
    missingEmailAndOrPassword(res);
  }
  const user = getUserByEmail(email, users);
  if(user){
     bcrypt.compare(password, user.password, (err, result) =>{
        if (result) {
          // the email and password match ==> set cookie session and redirect
          req.session.user_id = user.id;
          res.redirect('/urls');
        }
        else{
          emailAndOrPasswordDoNotMatch(res);
        }
     });
  }
  else{
    emailAndOrPasswordDoNotMatch(res);
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
    user = getUserById(userID, users);
    urlsOfUser  = urlsForUser(userID);
  }
  const templateVars = {
    user, urls: urlsOfUser
  };
  if (!user) {
    res.render('register', templateVars);
  }
  else{
    res.redirect('/urls');
  }
});



/**
 * POST request from the Form Submission to create a longURL
 */
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserById(userID, users);
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
 * If not Express will think that /new is a specific route like (/:shortURL)
 */
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserById(userID, users);
  if (!user) {
    res.redirect('/urls');
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
  const user = getUserById(userID, users);
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
  if(longURL.trim() === ""){
    return;
  }
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
    return res
            .status(404)
            .send(`The url ${shortURL} does not exist`);
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