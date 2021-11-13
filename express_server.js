/**@author: Youssef Nafaa < nafaayoussef@gmail.com>
 * @project: tinyapp for bootcamp at lighthouse lab Canada
 * @date: November 2021

/**
 * Using express to communicate between client and server
 */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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
const generateRandomAlphaNum = function () {
  let str = "";// will contain the final random 6 alphanum chars
  let rd; // get number between 0 and 9, or number between 65 and 90
          // or number between 97 and 122 to simulate number, uppercase,
          // lowecase
  let chx; // get a number between 0 and 2
  for (let i = 1; i <= 6; i++) {
    chx = getRndInteger(0,3);
    if (chx === 0) {
      // We use Math.floor because to get only integers.
      rd = getRndInteger(0, 10) // number between 0 and 9
      str += rd;
    }
    else if (chx === 1) {
      rd = getRndInteger(65, 91);
      // method will convert Unicode values to characters
      str += String.fromCharCode(rd); // uppercase char
    }
    else if (chx === 2) {
      rd = getRndInteger(97, 123) 
      str += String.fromCharCode(rd); // lowecase char
    }
  }
  return str.trim();
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Showing list of urls via the template urls_index
 */
app.get("/urls", (req, res) =>{
  const templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
});

/**
 * POST request from the Form Submission to create a longURL
 */
app.post("/urls", (req, res) => {
  // We retrieve data from the body of the request
  const longURL  = req.body.longURL;
  // Create a random shortURL 
  const shortURL = generateRandomAlphaNum();
  // Add key: value ("shortYURL": "longURL") to the object
  urlDatabase[shortURL] = req.body.longURL;
  res.send(urlDatabase);
});
/**
 * GET route to show the form to create an URL
 * Attention: This must be above any specific route (/urls/:id)
 * If not Express will think that /new is a specific route like
 * /:shortURL
 */
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/**
 * Render information about a single URL
   shortURL is from the page, we can get itfrom req.params
   longURL is the value for this shortURL from urlDatabase(key)
 */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});


/**
 * Listen on provided port
 */
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});