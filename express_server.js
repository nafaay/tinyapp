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
 * Object simulating a database to work on.
 * '"short urls" : "long urls"'
 */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/**
 * This function will take a number n and create a random
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
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


/**
 * Showing list of urls via the template urls_index
 */
app.get("/urls", (req, res) =>{
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

/**
 * Route to login
 */
app.post("/login", (req, res) =>{
  if (req.body.username) {
    res.cookie("username", req.body.username);
  }
  res.redirect("/urls");
});

/**
 * Route to login
 */
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

/**
 * POST request from the Form Submission to create a longURL
 */
app.post("/urls", (req, res) => {
  // Create a random shortURL
  const shortURL = generateRandomString();
  // Add key: value ("shortURL": "longURL") to the object
  if (req.body.longURL.trim() === "") {
    res.send("Must be not empty");
  }
  urlDatabase[shortURL] = req.body.longURL;
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
  const templateVars = {username : req.cookies["username"]};
  res.render("urls_new", templateVars);
});

/**
 * Render information about a single URL
   shortURL is from the page, we can get it from req.params
   longURL is the value for this shortURL from urlDatabase(key)
 */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const username = req.cookies['username'];

  const templateVars = { username, shortURL, longURL };
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