/**@author: Youssef Nafaa < nafaayoussef@gmail.com>
 * @project: tinyapp for bootcamp at lighthouse lab Canada
 * @date: November - December 2021
**/

/**  
* Using express to communicate between client and server
*/
const express = require("express");
const app = express();
/**
 * morgan to detect errors without killing the server each time
 */
const morgan = require("morgan");
/**
 *  to be able to encrypt passwords
 */
const bcrypt = require('bcryptjs');
/**
 * to use cookies
 */
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// helper that contains our helper functions
const {
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
} = require('./helper.js');


const PORT = 8080; // default port 8080

// MIDDLEWARES
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
  Object simulating a database of users.
  each user is an object of {id, email, password}
  here we encrypt password like that just to be able to make comparison
  when the user enters one, in real world the passwords are encrypted
  on the registartion and savec encrypted in the database
 */

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// GET routes

app.get("/", (req, res) => {
  const userID = req.session.user_id;
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
  const user = getUserById(user_id, users);
  const urls = urlsForUser(user_id, urlDatabase);
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
 * Route to GET register
 */
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const  user = getUserById(userID, users);
  const  urlsOfUser  = urlsForUser(userID, urlDatabase);
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
 * Route to GET login
 */
app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
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

  if (!user) { 
    return res.status(403).send("Not Authorized");
  }

  if (!urlDatabase[shortURL]) { 
    return urlDoesNotExist(res);
  }

  if (urlDatabase[shortURL].userID !== userID) { 
    return youHaveNoRights(res);
  }

  const { longURL } = urlDatabase[shortURL]
  const templateVars = {
    user, shortURL, longURL
  };

  res.render("urls_show", templateVars);
});

// POST routes
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
  else if (checkEmailAlreadyExists(email, users)) {
    emailAlreadyExists(res);
  }
  else{
    const userID1 = generateRandomString();
    const userID2 = generateRandomString();
    const id = userID1 + userID2;
    // we hash the password once the user registers
    bcrypt.hash(password, 10, (err, hash) => {
      const user = { id, email, password: hash };
      users[id] = user;
      
      req.session.user_id = id;
      res.redirect('/urls');
    });
  }
});

/**
 * POST request from the Form Submission to create a longURL
 */
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = getUserById(userID, users);
  if (!user) {
    res
      .status(403)
      .send("Not Authorized");
      return;
  }

  // Create a random shortURL
  const shortURL = generateRandomString();
  // Add key: value ("shortURL": "longURL") to the object
  if (req.body.longURL.trim() === "") {
    res.send("Must be not empty");
    return;
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
    res
      .status(404)
      .send(`The url ${shortURL} does not exist`);
      return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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
    res
      .status(404)
      .send(`The url ${shortURL} does not exist`);
      return;
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