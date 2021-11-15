/**@author: Youssef Nafaa < nafaayoussef@gmail.com>
 * @project: tinyapp for bootcamp at lighthouse lab Canada
 * @date: November 2021

/**
 * Using express to communicate between client and server
 */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());
/**
 * Set ejs as the view engine
 */
app.set("view engine", "ejs");

/**
 * bodyParser is a middleware that will help us
 * to read data buffer when using POST requests
 */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


/**
 * Object simulating a database of urls to work on.
 * '"short urls" : "long urls"'
 */
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  "b2xVn2":{
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  } ,
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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

/**
 * return all short and long urls of user if they exist 
 * if the user has no urls reurn {} 
 */
const getUrlsOfUserIfExist = function(userID){
  const objUrlsUser = {};
  for(key of Object.keys(urlDatabase)){
    if(urlDatabase[key]['userID'] === userID){
      const shortURL = key;
      const longURL  = urlDatabase[key]['longURL'];
      objUrlsUser[shortURL] = longURL;
    }
  }
  return objUrlsUser;
}

/**
 * return a valid user if exists if not return null 
 */
const checkIfUserExists = function(userID){
  let user = {};
  if (users.hasOwnProperty(userID)) {
    const email = users[userID].email;
    const password = users[userID].password;
    user = { userID, email, password }
  }
  else {
    user = null;
  }
  return user;
}

/**
 * check if the email entered by the user is always 
 * in databse of users (here object users) 
 */
const checkEmailAlreadyExists = function (email) {
  for (keys of Object.keys(users)) {
    if (users[keys]['email'] === email) {
      return true;
    }
  }
  return false;
}

/**
 * check if the password entered by the user is in the object
 * users to allow the user login in or not
 */
const checkPasswordIfExists = function (password) {
  for (keys of Object.keys(users)) {
    if (users[keys]['password'] === password) {
      return true;
    }
  }
  return false;
}

/**
 * This function will create a random
 * alphanumeric string to simulate generating a shortURL
 */
const generateRandomString = function() {
  let str = "";// will contain the final random 6 alphanum chars
  let rd; // get number between 0 and 9, or number between 65 and 90
  // or number between 97 and 122 to simulate numbers, uppercase and
  // lowecase characters
  let chx; // get a number between 0 and 2
  for (let i = 1; i <= 6; i++) {
    chx = getRndInteger(0,3);
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

const getRndInteger = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

app.get("/", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = checkIfUserExists(userID);
  if (!user) {
    res.redirect("/login");
  }
  const urlsOfUser =  getUrlsOfUserIfExist(userID);
  const templateVars = {
    // user, urls: urlDatabase
    user, urls: urlsOfUser
  };

  res.render("urls_index", templateVars);
});


/**
 * Showing list of urls via the template urls_index
 */
app.get("/urls", (req, res) =>{
  const userID = req.cookies['user_id'];
  let user;
  if(userID){
    user = checkIfUserExists(userID);
  }
  if(!user){
    return res.status(403).send(`You have to Register first`);
  }
  // const templateVars = {
  //   user, urls: urlDatabase
  // };
  const urlsOfUser = getUrlsOfUserIfExist(userID);
  const templateVars = {
    // user, urls: urlDatabase
    user, urls: urlsOfUser
  };
  res.render("urls_index", templateVars);
});

/**
 * Route to login
 */
// app.post("/logout", (req, res) => {
  app.get("/logout", (req, res) =>{
  res.clearCookie("user_id");
  res.redirect("/urls");
});

/**
 * Route to POST register
 */
 app.post("/register",(req, res) =>{
   const email = req.body.email;
   const password = req.body.password;
   // Ask the user to fill in the empty zones.
   if (!email || !password) {
     return res.status(403).send(`email or password is missing". Please <a href='/register'> Fill in empty areas</a>`)
   }

   if (checkEmailAlreadyExists(email)) {
     return res.status(403).send(`This email alrady exists". Please <a href='/register'> try another one</a>`)
   }
   const userID1 = generateRandomString();
   const userID2 = generateRandomString();
   const userID = userID1 + userID2;
   const user = { userID, email, password };
   users[userID] = user;
   res.cookie('user_id', userID);
   res.redirect('/urls');
 })

/**
 * Route to POST login
 */
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Ask the user to fill in the empty zones.
  if (!email || !password) {
    return res.status(403).send(`email or password is missing". Please <a href='/register'> Fill in empty areas</a>`)
  }
  // check if the email or the password is not in the database 
  // the user has to login with another email 
  // and or another password that match email and password in database
  if (!checkEmailAlreadyExists(email) || !checkPasswordIfExists(password)) {
    return res.status(403).send(`email or password does not match". Please <a href='/login'> try again</a>`)
  }

  res.redirect('/urls');
})


/**
 * Route to GET register
 */
app.get("/register", (req, res) =>{
  const userID = req.cookies['user_id'];
  let user;
  if (userID) {
    user = checkIfUserExists(userID);
  }
  const urlsOfUser = getUrlsOfUserIfExist(userID);
  const templateVars = {
    user, urls: urlsOfUser
  };
  if (!user) {
    res.render('register', templateVars);
  }
  res.redirect('/urls');
});

/**
 * Route to GET login
 */
app.get("/login", (req, res) => {
  const userID = req.cookies['user_id'];
  const user = checkIfUserExists(userID);
  if (!user) {
    res.render('login');
  }
  res.redirect('/urls');
});


/**
 * POST request from the Form Submission to create a longURL
 */
app.post("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
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
  const userUrl = {longURL, userID};
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
  const longURL = urlDatabase[shortURL];
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
  const userID = req.cookies['user_id'];
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
  const userID = req.cookies['user_id'];
  const user = checkIfUserExists(userID);
  if (!user) {
    res.status(403).send("Not Authorized");
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]['longURL'];
  const templateVars = {
    user, shortURL, longURL
  };
  res.render("urls_show", templateVars);
});


/**
 * read the object and if we find the key: value
 * shortURL: longURL we edit longURL with the one given
 * by the user
 */
app.post("/urls/:shortURL", (req, res) => {
  const longURL =  req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
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
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  }
});

/**
 * Listen on provided port
 */
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});